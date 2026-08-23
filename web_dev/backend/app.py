import os
import pickle
import json
import pandas as pd
import numpy as np
import re
import urllib.request
import urllib.parse
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from generate_data import generate_pickle_files

app = FastAPI(
    title="Movie Recommendation System API",
    description="FastAPI Backend for cosine similarity movie recommendations",
    version="1.0.0"
)

# Enable CORS for React frontend (http://localhost:5173 or all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins including http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for in-memory data storage
movies_df = None
similarity_matrix = None

def load_data():
    global movies_df, similarity_matrix
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    movie_dict_path = os.path.join(BASE_DIR, "movie_dict.pkl")
    similarity_path = os.path.join(BASE_DIR, "similarity.pkl")

    # Generate pickle files if they don't exist yet
    if not os.path.exists(movie_dict_path) or not os.path.exists(similarity_path):
        generate_pickle_files()

    try:
        with open(movie_dict_path, "rb") as f:
            movie_dict = pickle.load(f)
            movies_df = pd.DataFrame(movie_dict)

        with open(similarity_path, "rb") as f:
            similarity_matrix = pickle.load(f)

        print("🚀 Successfully loaded movie_dict.pkl and similarity.pkl into memory!")
        print(f"📊 Dataset size: {len(movies_df)} movies.")
    except Exception as e:
        print(f"❌ Error loading pickle files: {e}")
        generate_pickle_files()
        with open(movie_dict_path, "rb") as f:
            movies_df = pd.DataFrame(pickle.load(f))
        with open(similarity_path, "rb") as f:
            similarity_matrix = pickle.load(f)

# Load data on module load
load_data()

@app.get("/")
def health_check():
    """Health check route returning API status."""
    return {"status": "API is running"}

@app.get("/recommend")
def get_recommendations(movie: str = Query(..., description="Name of the movie to get recommendations for")):
    """
    Get top 5 recommended movies based on cosine similarity.
    Handles case-insensitive movie search matching.
    """
    if movies_df is None or similarity_matrix is None:
        raise HTTPException(status_code=500, detail="Model data is not loaded.")

    movie_clean = movie.strip()
    
    # Clean strings for better matching (remove spaces, hyphens, make lowercase)
    def clean_string(s):
        return s.lower().replace(" ", "").replace("-", "").replace(":", "")

    movie_clean_normalized = clean_string(movie_clean)
    
    # Check exact normalized match first
    matches = movies_df[movies_df['title'].apply(clean_string) == movie_clean_normalized]

    if matches.empty:
        # Partial match fallback search
        partial_matches = movies_df[movies_df['title'].apply(clean_string).str.contains(movie_clean_normalized, regex=False)]
        if not partial_matches.empty:
            matches = partial_matches
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Movie '{movie}' not found in dataset. Try searching for 'Inception', 'Dune', 'Interstellar', or 'The Dark Knight'."
            )

    # Get index of the matched movie
    movie_index = matches.index[0]
    searched_movie_title = movies_df.iloc[movie_index]['title']

    # Get similarity scores for all movies relative to the selected movie
    distances = similarity_matrix[movie_index]

    # Sort movies by similarity score in descending order (exclude searched movie itself at index 0)
    movie_list = sorted(list(enumerate(distances)), key=lambda x: x[1], reverse=True)[1:6]

    # Extract top 5 recommended movie titles
    recommended_movies = []
    for idx, score in movie_list:
        recommended_movies.append(movies_df.iloc[idx]['title'])

    return {
        "status": "success",
        "movie_searched": searched_movie_title,
        "recommendations": recommended_movies
    }

# Endpoint alias for /api/recommendations
@app.get("/api/recommendations")
def get_recommendations_alias(movie: str = Query("Inception", description="Movie title")):
    return get_recommendations(movie=movie)

@app.get("/trailer")
def get_trailer(movie: str):
    if not movie:
        raise HTTPException(status_code=400, detail="Movie title required")
    
    # Strategy 1: Try TMDB API videos if possible
    try:
        tmdb_key = "8265bd1679663a7ea12ac168da84d2e8"
        search_url = f"https://api.themoviedb.org/3/search/movie?query={urllib.parse.quote(movie)}&api_key={tmdb_key}"
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            if data.get('results'):
                movie_id = data['results'][0]['id']
                videos_url = f"https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key={tmdb_key}&language=en-US"
                req_vid = urllib.request.Request(videos_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req_vid, timeout=3) as v_resp:
                    v_data = json.loads(v_resp.read().decode())
                    results = v_data.get('results', [])
                    # Look for official trailer
                    for v in results:
                        if v.get('site') == 'YouTube' and v.get('type') == 'Trailer' and v.get('key'):
                            return {"status": "success", "video_id": v['key'], "source": "tmdb"}
                    # Fallback to any youtube key
                    for v in results:
                        if v.get('site') == 'YouTube' and v.get('key'):
                            return {"status": "success", "video_id": v['key'], "source": "tmdb"}
    except Exception as tmdb_err:
        pass

    # Strategy 2: Scrape YouTube search results
    try:
        url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(f"{movie} official trailer")
        
        req = urllib.request.Request(
            url, 
            data=None, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        )
        
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Match videoRenderer videoId
            video_ids = re.findall(r'"videoRenderer":\s*\{"videoId":\s*"([a-zA-Z0-9_-]{11})"', html)
            if not video_ids:
                # Match /watch?v=
                video_ids = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', html)
            if not video_ids:
                # General videoId regex
                video_ids = re.findall(r'\"videoId\":\"([a-zA-Z0-9_-]{11})\"', html)
            
            if video_ids:
                return {"status": "success", "video_id": video_ids[0], "source": "youtube_search"}
            else:
                return {"status": "error", "message": "No trailer found"}
            
    except Exception as e:
        return {"status": "error", "message": str(e)}
