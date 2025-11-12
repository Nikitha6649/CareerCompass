import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class MLRecommendationEngine:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.kmeans_model = KMeans(n_clusters=5, random_state=42)
        self.career_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
        # Initialize with sample data
        self._initialize_sample_data()
        self._train_models()
        print("✅ ML Recommendation Engine initialized!")
    
    def _initialize_sample_data(self):
        """Initialize with sample training data"""
        # Sample course data
        self.courses_data = pd.DataFrame({
            'title': [
                'Python for Data Science', 'Web Development Bootcamp', 'Machine Learning A-Z',
                'Digital Marketing Mastery', 'Cloud Computing AWS', 'React Native Development',
                'Data Analysis with R', 'Cybersecurity Fundamentals', 'AI and Deep Learning',
                'Project Management Professional', 'UX/UI Design Complete', 'Blockchain Development',
                'DevOps Engineering', 'Mobile App Development', 'Business Analytics',
                'Full Stack JavaScript', 'Data Visualization', 'Network Security',
                'Artificial Intelligence', 'Agile Project Management'
            ],
            'description': [
                'Learn Python programming for data analysis and machine learning applications',
                'Complete web development course covering HTML CSS JavaScript React Node.js',
                'Comprehensive machine learning course with hands-on projects and real datasets',
                'Master digital marketing strategies SEO social media advertising analytics',
                'Amazon Web Services cloud computing infrastructure deployment scaling',
                'Build cross-platform mobile applications using React Native framework',
                'Statistical analysis and data visualization using R programming language',
                'Information security fundamentals network security ethical hacking',
                'Deep learning neural networks computer vision natural language processing',
                'Project management methodologies tools leadership team coordination',
                'User experience design user interface design prototyping usability testing',
                'Blockchain technology cryptocurrency smart contracts decentralized applications',
                'DevOps practices continuous integration deployment automation monitoring',
                'iOS Android mobile application development native cross-platform',
                'Business intelligence data analytics reporting dashboard creation',
                'Full stack development JavaScript frameworks databases API development',
                'Data visualization tools Tableau Power BI charts graphs dashboards',
                'Network security protocols firewalls intrusion detection systems',
                'Artificial intelligence machine learning algorithms neural networks',
                'Agile methodologies scrum kanban project management frameworks'
            ],
            'category': [
                'Data Science', 'Web Development', 'Machine Learning', 'Digital Marketing',
                'Cloud Computing', 'Mobile Development', 'Data Science', 'Cybersecurity',
                'AI/ML', 'Project Management', 'Design', 'Blockchain',
                'DevOps', 'Mobile Development', 'Business Analytics', 'Web Development',
                'Data Visualization', 'Cybersecurity', 'AI/ML', 'Project Management'
            ],
            'difficulty': [
                'Intermediate', 'Beginner', 'Advanced', 'Beginner', 'Intermediate',
                'Intermediate', 'Intermediate', 'Beginner', 'Advanced', 'Beginner',
                'Beginner', 'Advanced', 'Advanced', 'Intermediate', 'Intermediate',
                'Intermediate', 'Beginner', 'Intermediate', 'Advanced', 'Beginner'
            ],
            'duration_hours': [40, 60, 50, 30, 45, 35, 38, 25, 55, 20, 42, 48, 52, 44, 32, 58, 28, 36, 62, 24],
            'rating': [4.5, 4.3, 4.7, 4.2, 4.4, 4.1, 4.6, 4.0, 4.8, 4.3, 4.4, 4.5, 4.6, 4.2, 4.3, 4.4, 4.1, 4.5, 4.7, 4.2]
        })
        
        # Sample user profiles
        self.user_profiles = pd.DataFrame({
            'user_id': range(1, 101),
            'interests': [
                'Data Science Machine Learning', 'Web Development JavaScript', 'Digital Marketing SEO',
                'Cloud Computing AWS', 'Mobile Development React', 'Cybersecurity Network',
                'AI Deep Learning', 'Project Management Agile', 'UX Design Prototyping',
                'Blockchain Cryptocurrency'
            ] * 10,
            'education_level': ['Bachelor', 'Master', 'High School', 'PhD', 'Associate'] * 20,
            'experience_years': np.random.randint(0, 15, 100),
            'career_goal': [
                'Data Scientist', 'Software Engineer', 'Digital Marketer', 'Cloud Architect',
                'Mobile Developer', 'Security Analyst', 'AI Engineer', 'Project Manager',
                'UX Designer', 'Blockchain Developer'
            ] * 10
        })
        
        # Sample interaction data
        np.random.seed(42)
        self.interactions = pd.DataFrame({
            'user_id': np.random.randint(1, 101, 500),
            'course_id': np.random.randint(0, 20, 500),
            'interaction_type': np.random.choice(['view', 'save', 'complete'], 500, p=[0.6, 0.3, 0.1]),
            'rating': np.random.choice([1, 2, 3, 4, 5], 500, p=[0.05, 0.1, 0.2, 0.35, 0.3]),
            'timestamp': pd.date_range('2023-01-01', periods=500, freq='H')
        })
    
    def _train_models(self):
        """Train all ML models"""
        print("🤖 Training ML models...")
        
        # 1. Content-based recommendation using TF-IDF
        course_text = self.courses_data['title'] + ' ' + self.courses_data['description']
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(course_text)
        
        # 2. User clustering based on interests and goals
        user_text = self.user_profiles['interests'] + ' ' + self.user_profiles['career_goal']
        user_tfidf = self.tfidf_vectorizer.transform(user_text)
        self.user_clusters = self.kmeans_model.fit_predict(user_tfidf.toarray())
        self.user_profiles['cluster'] = self.user_clusters
        
        # 3. Career path prediction model
        # Prepare features for career prediction
        features = pd.get_dummies(self.user_profiles[['education_level']])
        features['experience_years'] = self.user_profiles['experience_years']
        
        # Add TF-IDF features (reduced dimensionality)
        tfidf_features = pd.DataFrame(user_tfidf.toarray()[:, :50])
        # Convert TF-IDF column names to strings
        tfidf_features.columns = [f'tfidf_{i}' for i in range(tfidf_features.shape[1])]
        
        # Combine features and ensure all column names are strings
        features = pd.concat([features.reset_index(drop=True), tfidf_features], axis=1)
        features.columns = features.columns.astype(str)  # Fix: Convert all column names to strings
        
        # Train career classifier
        X = features
        y = self.user_profiles['career_goal']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        self.career_classifier.fit(X_train_scaled, y_train)
        accuracy = self.career_classifier.score(X_test_scaled, y_test)
        print(f"✅ Career prediction model accuracy: {accuracy:.2f}")
        
        # 4. Collaborative filtering similarity matrix
        self._build_collaborative_filtering()
        
        print("✅ All ML models trained successfully!")
    
    def _build_collaborative_filtering(self):
        """Build collaborative filtering recommendation system"""
        # Create user-item interaction matrix
        interaction_matrix = self.interactions.pivot_table(
            index='user_id', 
            columns='course_id', 
            values='rating', 
            fill_value=0
        )
        
        # Calculate user-user similarity
        self.user_similarity = cosine_similarity(interaction_matrix)
        self.interaction_matrix = interaction_matrix
        
        print("✅ Collaborative filtering model built!")
    
    def get_content_based_recommendations(self, user_interests, num_recommendations=5):
        """Content-based recommendations using TF-IDF and cosine similarity"""
        try:
            # Transform user interests to TF-IDF vector
            user_vector = self.tfidf_vectorizer.transform([user_interests])
            
            # Calculate similarity with all courses
            similarities = cosine_similarity(user_vector, self.tfidf_matrix).flatten()
            
            # Get top recommendations
            top_indices = similarities.argsort()[-num_recommendations-1:-1][::-1]
            
            recommendations = []
            for idx in top_indices:
                course = self.courses_data.iloc[idx]
                recommendations.append({
                    'title': course['title'],
                    'category': course['category'],
                    'difficulty': course['difficulty'],
                    'duration_hours': int(course['duration_hours']),
                    'rating': float(course['rating']),
                    'similarity_score': float(similarities[idx]),
                    'ml_confidence': min(float(similarities[idx] * 100), 95.0),
                    'recommendation_type': 'Content-Based ML'
                })
            
            return recommendations
        except Exception as e:
            print(f"Content-based recommendation error: {e}")
            return []
    
    def get_collaborative_recommendations(self, user_id, num_recommendations=5):
        """Collaborative filtering recommendations"""
        try:
            if user_id not in self.interaction_matrix.index:
                return []
            
            user_idx = list(self.interaction_matrix.index).index(user_id)
            user_similarities = self.user_similarity[user_idx]
            
            # Find similar users
            similar_users = user_similarities.argsort()[-6:-1][::-1]  # Top 5 similar users
            
            # Get courses liked by similar users
            recommendations = []
            user_courses = set(self.interaction_matrix.loc[user_id][self.interaction_matrix.loc[user_id] > 0].index)
            
            for similar_user_idx in similar_users:
                similar_user_id = self.interaction_matrix.index[similar_user_idx]
                similar_user_courses = self.interaction_matrix.loc[similar_user_id]
                
                for course_id, rating in similar_user_courses.items():
                    if rating >= 4 and course_id not in user_courses:  # High-rated courses not seen by user
                        if course_id < len(self.courses_data):
                            course = self.courses_data.iloc[course_id]
                            recommendations.append({
                                'title': course['title'],
                                'category': course['category'],
                                'difficulty': course['difficulty'],
                                'duration_hours': int(course['duration_hours']),
                                'rating': float(course['rating']),
                                'similarity_score': float(user_similarities[similar_user_idx]),
                                'ml_confidence': min(float(user_similarities[similar_user_idx] * 100), 90.0),
                                'recommendation_type': 'Collaborative Filtering ML'
                            })
            
            # Remove duplicates and return top recommendations
            seen = set()
            unique_recommendations = []
            for rec in recommendations:
                if rec['title'] not in seen:
                    seen.add(rec['title'])
                    unique_recommendations.append(rec)
                    if len(unique_recommendations) >= num_recommendations:
                        break
            
            return unique_recommendations
        except Exception as e:
            print(f"Collaborative filtering error: {e}")
            return []
    
    def predict_career_path(self, user_profile):
        """Predict career path using Random Forest classifier"""
        try:
            # Prepare user features
            user_data = pd.DataFrame([{
                'education_level': user_profile.get('education_level', 'Bachelor'),
                'experience_years': user_profile.get('experience_years', 0),
                'interests': user_profile.get('interests', ''),
                'career_goal': user_profile.get('career_goal', '')
            }])
            
            # Create feature vector - ensure same order as training
            features = pd.DataFrame()
            
            # Ensure all education levels are present in the same order as training
            for level in ['Associate', 'Bachelor', 'High School', 'Master', 'PhD']:
                col_name = f'education_level_{level}'
                features[col_name] = 0
            
            # Set the actual education level
            edu_level = user_data['education_level'].iloc[0]
            if f'education_level_{edu_level}' in features.columns:
                features.loc[0, f'education_level_{edu_level}'] = 1
            
            # Add experience years in the same position as during training
            features['experience_years'] = user_data['experience_years']
            
            # Add TF-IDF features in the same order as training
            user_text = user_data['interests'] + ' ' + user_data['career_goal']
            user_tfidf = self.tfidf_vectorizer.transform(user_text)
            
            # Ensure we use the same feature names and order as during training
            for i in range(min(50, user_tfidf.shape[1])):
                features[f'tfidf_{i}'] = user_tfidf.toarray()[0, i] if i < user_tfidf.shape[1] else 0
            
            # Ensure all column names are strings
            features.columns = features.columns.astype(str)
            
            # Scale features
            final_features_scaled = self.scaler.transform(features)
            
            # Predict career paths with probabilities
            predictions = self.career_classifier.predict_proba(final_features_scaled)[0]
            classes = self.career_classifier.classes_
            
            # Get top 3 predictions
            top_indices = predictions.argsort()[-3:][::-1]
            
            career_predictions = []
            for idx in top_indices:
                career_predictions.append({
                    'career_path': classes[idx],
                    'probability': float(predictions[idx]),
                    'confidence': min(float(predictions[idx] * 100), 95.0),
                    'prediction_type': 'Random Forest ML'
                })
            
            return career_predictions
        except Exception as e:
            print(f"Career prediction error: {e}")
            # Return fallback predictions when error occurs
            return self._get_simple_career_predictions() if hasattr(self, '_get_simple_career_predictions') else []
    
    def get_user_cluster_insights(self, user_interests):
        """Get insights about user cluster using K-Means"""
        try:
            # Transform user interests
            user_vector = self.tfidf_vectorizer.transform([user_interests])
            user_cluster = self.kmeans_model.predict(user_vector.toarray())[0]
            
            # Get similar users in the same cluster
            cluster_users = self.user_profiles[self.user_profiles['cluster'] == user_cluster]
            
            # Analyze cluster characteristics
            common_goals = cluster_users['career_goal'].value_counts().head(3)
            avg_experience = cluster_users['experience_years'].mean()
            common_education = cluster_users['education_level'].value_counts().head(3)
            
            insights = {
                'cluster_id': int(user_cluster),
                'cluster_size': len(cluster_users),
                'common_career_goals': common_goals.to_dict(),
                'average_experience': float(avg_experience),
                'common_education_levels': common_education.to_dict(),
                'analysis_type': 'K-Means Clustering ML'
            }
            
            return insights
        except Exception as e:
            print(f"Cluster analysis error: {e}")
            return {}
    
    def get_hybrid_recommendations(self, user_profile, num_recommendations=8):
        """Hybrid recommendation combining multiple ML approaches"""
        try:
            user_interests = user_profile.get('interests', '')
            user_id = user_profile.get('user_id', np.random.randint(1, 101))
            
            # Get recommendations from different ML models
            content_recs = self.get_content_based_recommendations(user_interests, 4)
            collab_recs = self.get_collaborative_recommendations(user_id, 4)
            
            # Combine and rank recommendations
            all_recommendations = content_recs + collab_recs
            
            # Remove duplicates and sort by confidence
            seen_titles = set()
            unique_recs = []
            for rec in all_recommendations:
                if rec['title'] not in seen_titles:
                    seen_titles.add(rec['title'])
                    unique_recs.append(rec)
            
            # Sort by ML confidence score
            unique_recs.sort(key=lambda x: x['ml_confidence'], reverse=True)
            
            return unique_recs[:num_recommendations]
        except Exception as e:
            print(f"Hybrid recommendation error: {e}")
            return []
    
    def save_models(self, model_dir='ml_models'):
        """Save trained models"""
        import os
        os.makedirs(model_dir, exist_ok=True)
        
        joblib.dump(self.tfidf_vectorizer, f'{model_dir}/tfidf_vectorizer.pkl')
        joblib.dump(self.kmeans_model, f'{model_dir}/kmeans_model.pkl')
        joblib.dump(self.career_classifier, f'{model_dir}/career_classifier.pkl')
        joblib.dump(self.scaler, f'{model_dir}/scaler.pkl')
        
        print(f"✅ ML models saved to {model_dir}/")
    
    def load_models(self, model_dir='ml_models'):
        """Load pre-trained models"""
        try:
            self.tfidf_vectorizer = joblib.load(f'{model_dir}/tfidf_vectorizer.pkl')
            self.kmeans_model = joblib.load(f'{model_dir}/kmeans_model.pkl')
            self.career_classifier = joblib.load(f'{model_dir}/career_classifier.pkl')
            self.scaler = joblib.load(f'{model_dir}/scaler.pkl')
            print(f"✅ ML models loaded from {model_dir}/")
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            self._train_models()  # Fallback to training new models

# Deep Learning Model for Advanced Recommendations
class DLRecommendationEngine:
    def __init__(self):
        try:
            import tensorflow as tf
            from tensorflow.keras.models import Sequential
            from tensorflow.keras.layers import Dense, Embedding, Flatten, Dropout
            from tensorflow.keras.optimizers import Adam
            
            self.tf = tf
            self.Sequential = Sequential
            self.Dense = Dense
            self.Embedding = Embedding
            self.Flatten = Flatten
            self.Dropout = Dropout
            self.Adam = Adam
            
            self.model = None
            self._build_neural_network()
            print("✅ Deep Learning Recommendation Engine initialized!")
        except ImportError:
            print("⚠️ TensorFlow not available. Install with: pip install tensorflow")
            self.tf = None
    
    def _build_neural_network(self):
        """Build neural network for recommendation"""
        if not self.tf:
            return
        
        try:
            # Simple neural network for user-item interaction prediction
            self.model = self.Sequential([
                self.Dense(128, activation='relu', input_shape=(100,)),  # User features
                self.Dropout(0.3),
                self.Dense(64, activation='relu'),
                self.Dropout(0.2),
                self.Dense(32, activation='relu'),
                self.Dense(1, activation='sigmoid')  # Recommendation score
            ])
            
            self.model.compile(
                optimizer=self.Adam(learning_rate=0.001),
                loss='binary_crossentropy',
                metrics=['accuracy']
            )
            
            print("✅ Neural network model built!")
        except Exception as e:
            print(f"❌ Error building neural network: {e}")
    
    def train_neural_network(self, X_train, y_train, epochs=50):
        """Train the neural network"""
        if not self.model:
            return
        
        try:
            history = self.model.fit(
                X_train, y_train,
                epochs=epochs,
                batch_size=32,
                validation_split=0.2,
                verbose=0
            )
            
            print(f"✅ Neural network trained for {epochs} epochs!")
            return history
        except Exception as e:
            print(f"❌ Error training neural network: {e}")
            return None
    
    def predict_user_preferences(self, user_features):
        """Predict user preferences using neural network"""
        if not self.model:
            return []
        
        try:
            predictions = self.model.predict(user_features, verbose=0)
            return predictions.flatten()
        except Exception as e:
            print(f"❌ Error making predictions: {e}")
            return []

# Initialize ML engines
ml_engine = MLRecommendationEngine()
dl_engine = DLRecommendationEngine()
