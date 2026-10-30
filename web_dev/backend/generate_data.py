import os
import pickle
import numpy as np
import pandas as pd
import ast
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def generate_pickle_files():
    movie_dict_path = os.path.join(os.path.dirname(__file__), "movie_dict.pkl")
    similarity_path = os.path.join(os.path.dirname(__file__), "similarity.pkl")
    
    # If both files exist and are valid pickle files, keep them
    if os.path.exists(movie_dict_path) and os.path.exists(similarity_path):
        try:
            with open(movie_dict_path, "rb") as f:
                data = pickle.load(f)
                if isinstance(data, (dict, pd.DataFrame)):
                    print("✅ Found existing valid movie_dict.pkl and similarity.pkl files.")
                    return
        except Exception:
            print("⚠️ Existing pickle file corrupt or incomplete. Regenerating data...")

    print("⚡ Generating production movie dataset from TMDB CSV files...")

    # Search candidate paths for TMDB dataset
    candidate_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
        os.path.dirname(__file__),
        os.path.expanduser("~/Desktop/ML_PROJECTS"),
    ]
    movies_csv = None
    credits_csv = None
    for d in candidate_dirs:
        m_path = os.path.join(d, "tmdb_5000_movies.csv")
        c_path = os.path.join(d, "tmdb_5000_credits.csv")
        if os.path.exists(m_path) and os.path.exists(c_path):
            movies_csv = m_path
            credits_csv = c_path
            break
    
    if not movies_csv or not credits_csv:
        print(f"❌ Could not find TMDB CSV files in candidate directories")
        return

    # Load data
    movies = pd.read_csv(movies_csv)
    credits = pd.read_csv(credits_csv)

    # Merge data
    movies = movies.merge(credits, on='title')

    # Keep relevant columns
    movies = movies[['movie_id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew']]
    movies.dropna(inplace=True)

    def convert(text):
        L = []
        try:
            for i in ast.literal_eval(text):
                L.append(i['name'])
        except Exception:
            pass
        return L

    def convert3(text):
        L = []
        counter = 0
        try:
            for i in ast.literal_eval(text):
                if counter != 3:
                    L.append(i['name'])
                    counter += 1
                else:
                    break
        except Exception:
            pass
        return L

    def fetch_director(text):
        L = []
        try:
            for i in ast.literal_eval(text):
                if i['job'] == 'Director':
                    L.append(i['name'])
                    break
        except Exception:
            pass
        return L

    print("Processing genres and keywords...")
    movies['genres'] = movies['genres'].apply(convert)
    movies['keywords'] = movies['keywords'].apply(convert)
    
    print("Processing cast and crew...")
    movies['cast'] = movies['cast'].apply(convert3)
    movies['crew'] = movies['crew'].apply(fetch_director)
    
    movies['overview'] = movies['overview'].apply(lambda x: x.split() if isinstance(x, str) else [])
    
    # Remove spaces for tags
    movies['genres'] = movies['genres'].apply(lambda x: [i.replace(" ","") for i in x])
    movies['keywords'] = movies['keywords'].apply(lambda x: [i.replace(" ","") for i in x])
    movies['cast'] = movies['cast'].apply(lambda x: [i.replace(" ","") for i in x])
    movies['crew'] = movies['crew'].apply(lambda x: [i.replace(" ","") for i in x])
    
    movies['tags'] = movies['overview'] + movies['genres'] + movies['keywords'] + movies['cast'] + movies['crew']
    
    new_df = movies[['movie_id', 'title', 'tags']].copy()
    new_df['tags'] = new_df['tags'].apply(lambda x: " ".join(x))
    new_df['tags'] = new_df['tags'].apply(lambda x: x.lower())
    
    print("Vectorizing tags...")
    cv = CountVectorizer(max_features=5000, stop_words='english')
    vectors = cv.fit_transform(new_df['tags']).toarray()
    
    print("Calculating cosine similarity matrix (this might take a few moments)...")
    similarity_matrix = cosine_similarity(vectors)
    
    print("Saving dictionaries to pickle files...")
    movie_dict = new_df.to_dict()
    
    with open(movie_dict_path, "wb") as f:
        pickle.dump(movie_dict, f)
        
    with open(similarity_path, "wb") as f:
        pickle.dump(similarity_matrix, f)

    print(f"✅ Successfully Generated {movie_dict_path}")
    print(f"✅ Successfully Generated {similarity_path}")

if __name__ == "__main__":
    generate_pickle_files()

