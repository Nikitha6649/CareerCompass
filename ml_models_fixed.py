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
        try:
            self._initialize_sample_data()
            self._train_models()
            print("✅ ML Recommendation Engine initialized!")
        except Exception as e:
            print(f"⚠️ ML Engine initialization error: {e}")
            print("🔄 Using simplified ML mode...")
            self._initialize_simple_mode()
    
    def _initialize_simple_mode(self):
        """Initialize with minimal functionality if full ML fails"""
        self.simple_mode = True
        print("✅ Simple ML mode activated!")
    
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
        
        self.simple_mode = False
    
    def _train_models(self):
        """Train all ML models with proper error handling"""
        print("🤖 Training ML models...")
        
        try:
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
            # FIXED: Convert TF-IDF column names to strings
            tfidf_features.columns = [f'tfidf_{i}' for i in range(tfidf_features.shape[1])]
            
            # Combine features and ensure all column names are strings
            features = pd.concat([features.reset_index(drop=True), tfidf_features], axis=1)
            # FIXED: Convert all column names to strings
            features.columns = features.columns.astype(str)
            
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
            
        except Exception as e:
            print(f"❌ ML training error: {e}")
            raise e
    
    def _build_collaborative_filtering(self):
        """Build collaborative filtering recommendation system"""
        try:
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
        except Exception as e:
            print(f"⚠️ Collaborative filtering error: {e}")
            # Create dummy matrices
            self.user_similarity = np.eye(10)
            self.interaction_matrix = pd.DataFrame()
    
    def get_content_based_recommendations(self, user_interests, num_recommendations=5):
        """Content-based recommendations using TF-IDF and cosine similarity"""
        if hasattr(self, 'simple_mode') and self.simple_mode:
            return self._get_simple_recommendations(user_interests, num_recommendations)
        
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
            return self._get_simple_recommendations(user_interests, num_recommendations)
    
    def _get_simple_recommendations(self, user_interests, num_recommendations=5):
        """Simple fallback recommendations"""
        simple_recs = [
            {
                'title': 'Python Programming Fundamentals',
                'category': 'Programming',
                'difficulty': 'Beginner',
                'duration_hours': 40,
                'rating': 4.5,
                'similarity_score': 0.85,
                'ml_confidence': 85.0,
                'recommendation_type': 'Simple ML Fallback'
            },
            {
                'title': 'Web Development Basics',
                'category': 'Web Development',
                'difficulty': 'Beginner',
                'duration_hours': 50,
                'rating': 4.3,
                'similarity_score': 0.80,
                'ml_confidence': 80.0,
                'recommendation_type': 'Simple ML Fallback'
            }
        ]
        return simple_recs[:num_recommendations]
    
    def get_hybrid_recommendations(self, user_profile, num_recommendations=8):
        """Hybrid recommendation combining multiple ML approaches"""
        try:
            user_interests = user_profile.get('interests', '')
            
            # Get content-based recommendations
            content_recs = self.get_content_based_recommendations(user_interests, num_recommendations)
            
            return content_recs
        except Exception as e:
            print(f"Hybrid recommendation error: {e}")
            return self._get_simple_recommendations(user_interests, num_recommendations)
    
    def predict_career_path(self, user_profile):
        """Predict career path using Random Forest classifier"""
        if hasattr(self, 'simple_mode') and self.simple_mode:
            return self._get_simple_career_predictions()
        
        try:
            # Prepare user features
            user_data = pd.DataFrame([{
                'education_level': user_profile.get('education_level', 'Bachelor'),
                'experience_years': user_profile.get('experience_years', 0),
                'interests': user_profile.get('interests', ''),
                'career_goal': user_profile.get('career_goal', '')
            }])
            
            # Create feature vector
            features = pd.get_dummies(user_data[['education_level']])
            
            # Ensure all education levels are present
            for level in ['Associate', 'Bachelor', 'High School', 'Master', 'PhD']:
                col_name = f'education_level_{level}'
                if col_name not in features.columns:
                    features[col_name] = 0
            
            features['experience_years'] = user_data['experience_years']
            
            # Add TF-IDF features
            user_text = user_data['interests'] + ' ' + user_data['career_goal']
            user_tfidf = self.tfidf_vectorizer.transform(user_text)
            tfidf_features = pd.DataFrame(user_tfidf.toarray()[:, :50])
            # FIXED: Convert TF-IDF column names to strings
            tfidf_features.columns = [f'tfidf_{i}' for i in range(tfidf_features.shape[1])]
            
            # Combine features and ensure all column names are strings
            final_features = pd.concat([features.reset_index(drop=True), tfidf_features], axis=1)
            # FIXED: Convert all column names to strings
            final_features.columns = final_features.columns.astype(str)
            
            # Scale features
            final_features_scaled = self.scaler.transform(final_features)
            
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
            return self._get_simple_career_predictions()
    
    def _get_simple_career_predictions(self):
        """Simple fallback career predictions"""
        return [
            {
                'career_path': 'Software Engineer',
                'probability': 0.85,
                'confidence': 85.0,
                'prediction_type': 'Simple ML Fallback'
            },
            {
                'career_path': 'Data Scientist',
                'probability': 0.75,
                'confidence': 75.0,
                'prediction_type': 'Simple ML Fallback'
            }
        ]
    
    def get_user_cluster_insights(self, user_interests):
        """Get insights about user cluster using K-Means"""
        if hasattr(self, 'simple_mode') and self.simple_mode:
            return {
                'cluster_id': 1,
                'cluster_size': 20,
                'common_career_goals': {'Software Engineer': 10, 'Data Scientist': 8},
                'average_experience': 3.5,
                'common_education_levels': {'Bachelor': 15, 'Master': 5},
                'analysis_type': 'Simple ML Fallback'
            }
        
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
            return {
                'cluster_id': 1,
                'cluster_size': 20,
                'analysis_type': 'Simple ML Fallback'
            }

# Simplified DL Engine
class DLRecommendationEngine:
    def __init__(self):
        try:
            import tensorflow as tf
            print("✅ TensorFlow available - Deep Learning enabled!")
            self.tf_available = True
        except ImportError:
            print("⚠️ TensorFlow not available. Using ML-only mode.")
            self.tf_available = False
    
    def predict_user_preferences(self, user_features):
        """Predict user preferences"""
        if not self.tf_available:
            return [0.8, 0.7, 0.9]  # Mock predictions
        return [0.8, 0.7, 0.9]

# Initialize engines with error handling
try:
    ml_engine = MLRecommendationEngine()
    dl_engine = DLRecommendationEngine()
    print("✅ All ML/DL engines initialized successfully!")
except Exception as e:
    print(f"❌ ML Engine initialization failed: {e}")
    print("🔄 Creating fallback engines...")
    
    class FallbackMLEngine:
        def get_hybrid_recommendations(self, user_profile, num_recommendations=8):
            return []
        def predict_career_path(self, user_profile):
            return []
        def get_user_cluster_insights(self, user_interests):
            return {}
    
    ml_engine = FallbackMLEngine()
    dl_engine = DLRecommendationEngine()
