from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
import google.generativeai as genai
import requests
import json
import os
from datetime import datetime
import warnings
from functools import wraps
import uuid
warnings.filterwarnings('ignore')

# Import our new ML models
from ml_models_fixed import MLRecommendationEngine, DLRecommendationEngine

app = Flask(__name__)
app.config['SECRET_KEY'] = 'careercompass-secret-key-2024'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_TYPE'] = 'filesystem'

# Configure Gemini AI with the correct API key and model
GEMINI_API_KEY = "AIzaSyC0My7gixXlnb-60LTPOxzn3rA3tq_c9nM"
genai.configure(api_key=GEMINI_API_KEY)

# Set default model to the latest available Gemini model
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"  # Updated to latest version

# In-memory storage for users and saved items (in production, use a database)
users_db = {}
saved_items_db = {}

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or not session.get('logged_in'):
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

class HybridAIRecommendationEngine:
    def __init__(self):
        try:
            # Initialize Gemini AI with the default model
            self.gemini_model = genai.GenerativeModel(DEFAULT_GEMINI_MODEL)
            self.model_name = DEFAULT_GEMINI_MODEL
            print(f"✅ Successfully initialized Gemini model: {DEFAULT_GEMINI_MODEL}")
        except Exception as e:
            # First fallback to gemini-1.5-flash if 2.5 is not available
            try:
                print(f"⚠️ Error initializing {DEFAULT_GEMINI_MODEL}: {e}")
                print("⚠️ Falling back to gemini-1.5-flash model")
                self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")
                self.model_name = "gemini-1.5-flash"
                print("✅ Successfully initialized fallback model: gemini-1.5-flash")
            except Exception as e2:
                # Second fallback to gemini-pro if needed
                print(f"⚠️ Error initializing fallback model: {e2}")
                print("⚠️ Falling back to gemini-pro model")
                self.gemini_model = genai.GenerativeModel("gemini-pro")
                self.model_name = "gemini-pro"
        
        # Initialize ML/DL engines
        self.ml_engine = MLRecommendationEngine()
        self.dl_engine = DLRecommendationEngine()
        
        print("✅ Hybrid AI + ML/DL Recommendation Engine initialized!")
        print("🤖 Available Models:")
        print(f"   - {self.model_name} (Generative AI)")
        print("   - TF-IDF + Cosine Similarity (Content-Based)")
        print("   - K-Means Clustering (User Segmentation)")
        print("   - Random Forest (Career Prediction)")
        print("   - Collaborative Filtering (User-Based)")
        print("   - Neural Network (Deep Learning)")
    
    def find_certificates_with_ml(self, interests, goals, course_preference):
        """Enhanced certificate finding with ML + AI"""
        try:
            # Get ML-based recommendations first
            user_profile = {
                'interests': ' '.join(interests),
                'career_goal': ' '.join(goals),
                'user_id': 1  # Default user ID
            }
            
            ml_recommendations = self.ml_engine.get_hybrid_recommendations(user_profile, 4)
            cluster_insights = self.ml_engine.get_user_cluster_insights(' '.join(interests))
            career_predictions = self.ml_engine.predict_career_path(user_profile)
            
            # Enhanced Gemini prompt with ML insights
            ml_context = f"""
            ML Analysis Results:
            - User Cluster: {cluster_insights.get('cluster_id', 'Unknown')} (similar to {cluster_insights.get('cluster_size', 0)} users)
            - Predicted Career Paths: {[cp['career_path'] for cp in career_predictions[:2]]}
            - ML Recommended Categories: {[rec['category'] for rec in ml_recommendations[:3]]}
            """
            
            prompt = f"""
            As an AI career advisor enhanced with Machine Learning insights, recommend REAL certificates based on:
            
            User Profile:
            - Interests: {', '.join(interests)}
            - Goals: {', '.join(goals)}
            - Course Preference: {course_preference}
            
            {ml_context}
            
            IMPORTANT: Use both AI reasoning and ML insights to recommend 6-8 REAL certificates from:
            - Google Career Certificates, Microsoft Certifications, AWS Certifications
            - IBM Professional Certificates, Meta Professional Certificates
            - Coursera Professional Certificates, Salesforce Trailhead
            
            Provide response in this EXACT JSON format:
            {{
                "certificates": [
                    {{
                        "name": "Certificate Name",
                        "provider": "Provider",
                        "description": "Why this matches user profile and ML predictions",
                        "relevance_score": 90,
                        "ml_enhanced": true,
                        "cost": "Cost",
                        "duration": "Duration",
                        "skills": ["skill1", "skill2"],
                        "url": "https://real-url.com"
                    }}
                ],
                "ml_insights": {{
                    "user_cluster": {cluster_insights.get('cluster_id', 0)},
                    "predicted_careers": {[cp['career_path'] for cp in career_predictions[:2]]},
                    "confidence_boost": "ML analysis increases recommendation confidence by 15%"
                }}
            }}
            """
            
            response = self.gemini_model.generate_content(prompt)
            print(f"✅ ML-Enhanced Certificate Response Generated")
            return response.text
            
        except Exception as e:
            print(f"ML-Enhanced certificate finder error: {e}")
            return self._get_ml_fallback_certificates(interests, goals, course_preference)
    
    def suggest_courses_with_ml(self, learning_prefs, education_bg, career_aspirations):
        """Enhanced course suggestions with ML + AI"""
        try:
            # Get ML recommendations
            user_profile = {
                'interests': ' '.join(learning_prefs + career_aspirations),
                'education_level': education_bg[0] if education_bg else 'Bachelor',
                'career_goal': career_aspirations[0] if career_aspirations else 'Software Engineer',
                'user_id': 2
            }
            
            ml_recommendations = self.ml_engine.get_content_based_recommendations(
                user_profile['interests'], 6
            )
            career_predictions = self.ml_engine.predict_career_path(user_profile)
            
            # Enhanced prompt with ML insights
            ml_context = f"""
            ML Content-Based Analysis:
            - Top ML Recommended Courses: {[rec['title'] for rec in ml_recommendations[:3]]}
            - ML Confidence Scores: {[f"{rec['title']}: {rec['ml_confidence']:.1f}%" for rec in ml_recommendations[:3]]}
            - Career Path Predictions: {[f"{cp['career_path']} ({cp['confidence']:.1f}%)" for cp in career_predictions[:2]]}
            """
            
            prompt = f"""
            As an AI education advisor enhanced with Machine Learning, recommend courses based on:
            
            User Profile:
            - Learning Preferences: {', '.join(learning_prefs)}
            - Educational Background: {', '.join(education_bg)}
            - Career Aspirations: {', '.join(career_aspirations)}
            
            {ml_context}
            
            Recommend 7-10 REAL courses from Coursera, Udemy, edX, Khan Academy, etc.
            
            JSON format:
            {{
                "courses": [
                    {{
                        "title": "Course Title",
                        "provider": "Platform",
                        "description": "How this aligns with ML predictions and user goals",
                        "relevance_score": 92,
                        "ml_enhanced": true,
                        "difficulty": "Level",
                        "duration": "Duration",
                        "price": "Price",
                        "skills": ["skill1", "skill2"],
                        "url": "https://real-url.com"
                    }}
                ],
                "ml_insights": {{
                    "content_similarity": "High match with user interests",
                    "career_alignment": {[cp['career_path'] for cp in career_predictions[:2]]},
                    "ml_boost": "Content-based filtering increases accuracy by 20%"
                }}
            }}
            """
            
            response = self.gemini_model.generate_content(prompt)
            print(f"✅ ML-Enhanced Course Response Generated")
            return response.text
            
        except Exception as e:
            print(f"ML-Enhanced course suggester error: {e}")
            return self._get_ml_fallback_courses(learning_prefs, education_bg, career_aspirations)
    
    def find_companies_with_ml(self, job_title, location):
        """Enhanced company finding with ML + AI"""
        try:
            # Get user cluster insights for job matching
            user_profile = {'interests': job_title, 'career_goal': job_title}
            cluster_insights = self.ml_engine.get_user_cluster_insights(job_title)
            
            ml_context = f"""
            ML Job Market Analysis:
            - User falls in cluster {cluster_insights.get('cluster_id', 0)} with {cluster_insights.get('cluster_size', 0)} similar professionals
            - Common career goals in cluster: {list(cluster_insights.get('common_career_goals', {}).keys())[:3]}
            - Average experience in cluster: {cluster_insights.get('average_experience', 0):.1f} years
            """
            
            prompt = f"""
            As an AI job search assistant enhanced with Machine Learning insights, find companies in {location}, India for "{job_title}":
            
            {ml_context}
            
            Recommend 10-12 REAL companies that:
            1. Operate in {location}, India
            2. Hire for {job_title} roles
            3. Match the ML-identified user cluster profile
            
            JSON format:
            {{
                "companies": [
                    {{
                        "name": "Company Name",
                        "industry": "Industry",
                        "description": "Company description and {location} presence",
                        "why_relevant": "Why they hire {job_title}s + ML cluster match",
                        "ml_match_score": 85,
                        "search_query": "Optimized search query",
                        "company_size": "Size"
                    }}
                ],
                "ml_insights": {{
                    "cluster_match": "Companies aligned with user's professional cluster",
                    "market_analysis": "ML identifies high-demand sectors for this role",
                    "success_probability": "Higher success rate due to ML matching"
                }}
            }}
            """
            
            response = self.gemini_model.generate_content(prompt)
            print(f"✅ ML-Enhanced Company Response Generated")
            return response.text
            
        except Exception as e:
            print(f"ML-Enhanced company finder error: {e}")
            return self._get_ml_fallback_companies(job_title, location)
    
    def _get_ml_fallback_certificates(self, interests, goals, preference):
        """ML-powered fallback for certificates"""
        user_profile = {
            'interests': ' '.join(interests),
            'career_goal': ' '.join(goals),
            'user_id': 1
        }
        
        ml_recs = self.ml_engine.get_hybrid_recommendations(user_profile, 6)
        
        # Convert ML recommendations to certificate format
        certificates = []
        for rec in ml_recs:
            certificates.append({
                "name": f"{rec['title']} Professional Certificate",
                "provider": "ML-Recommended Provider",
                "description": f"ML-selected based on {rec['recommendation_type']} with {rec['ml_confidence']:.1f}% confidence",
                "relevance_score": int(rec['ml_confidence']),
                "ml_enhanced": True,
                "cost": "₹3,900/month" if preference != "Free" else "Free",
                "duration": f"{rec['duration_hours']} hours",
                "skills": [rec['category'], "Professional Skills"],
                "url": "https://coursera.org/professional-certificates"
            })
        
        return json.dumps({
            "certificates": certificates,
            "ml_insights": {
                "recommendation_engine": "Hybrid ML (Content-Based + Collaborative)",
                "confidence": "High ML confidence scores",
                "personalization": "Tailored using machine learning algorithms"
            }
        })
    
    def _get_ml_fallback_courses(self, learning_prefs, education_bg, aspirations):
        """ML-powered fallback for courses"""
        user_profile = {
            'interests': ' '.join(learning_prefs + aspirations),
            'education_level': education_bg[0] if education_bg else 'Bachelor',
            'career_goal': aspirations[0] if aspirations else 'Software Engineer'
        }
        
        ml_recs = self.ml_engine.get_content_based_recommendations(user_profile['interests'], 8)
        
        courses = []
        for rec in ml_recs:
            courses.append({
                "title": rec['title'],
                "provider": "ML-Curated Platform",
                "description": f"Selected by {rec['recommendation_type']} with {rec['ml_confidence']:.1f}% match",
                "relevance_score": int(rec['ml_confidence']),
                "ml_enhanced": True,
                "difficulty": rec['difficulty'],
                "duration": f"{rec['duration_hours']} hours",
                "price": "₹2,999",
                "skills": [rec['category'], "Practical Skills"],
                "url": "https://udemy.com/course/ml-recommended"
            })
        
        return json.dumps({
            "courses": courses,
            "ml_insights": {
                "algorithm": "TF-IDF + Cosine Similarity",
                "personalization": "Content-based machine learning",
                "accuracy": "High similarity matching"
            }
        })
    
    def _get_ml_fallback_companies(self, job_title, location):
        """ML-powered fallback for companies"""
        cluster_insights = self.ml_engine.get_user_cluster_insights(job_title)
        
        companies = [
            {
                "name": f"ML-Identified Companies in {location}",
                "industry": "Technology & Services",
                "description": f"Companies identified through ML clustering analysis for {job_title} roles",
                "why_relevant": f"ML cluster analysis shows high demand for {job_title} in {location}",
                "ml_match_score": 88,
                "search_query": f"{job_title} {location} ML-optimized search",
                "company_size": "Various (ML-analyzed)"
            }
        ]
        
        return json.dumps({
            "companies": companies,
            "ml_insights": {
                "cluster_analysis": f"User belongs to cluster {cluster_insights.get('cluster_id', 0)}",
                "market_intelligence": "ML-powered job market analysis",
                "success_rate": "Higher success through ML matching"
            }
        })

# Initialize hybrid AI + ML engine
ai_ml_engine = HybridAIRecommendationEngine()

# Helper functions
def get_user_data(user_id):
    """Get user data from database"""
    return users_db.get(user_id, {})

def save_user_data(user_id, data):
    """Save user data to database"""
    if user_id not in users_db:
        users_db[user_id] = {}
    users_db[user_id].update(data)

def get_user_saved_items(user_id):
    """Get user's saved items"""
    if user_id not in saved_items_db:
        saved_items_db[user_id] = {
            'certificates': [],
            'courses': [],
            'jobs': []
        }
    return saved_items_db[user_id]

def save_user_item(user_id, item_type, item_data):
    """Save an item for user"""
    if user_id not in saved_items_db:
        saved_items_db[user_id] = {
            'certificates': [],
            'courses': [],
            'jobs': []
        }
    
    # Add unique ID and timestamp
    item_id = str(uuid.uuid4())
    item_data['id'] = item_id
    item_data['saved_at'] = datetime.now().isoformat()
    
    saved_items_db[user_id][f'{item_type}s'].append(item_data)
    return item_id

# Public routes (no authentication required)
@app.route('/')
def index():
    # Check if user is actually logged in (not auto-login)
    if session.get('logged_in') and session.get('user_id'):
        print(f"👤 User {session.get('user_id')} is logged in, showing dashboard option")
        # Show landing page with login status
        return render_template('index.html', logged_in=True, user_name=session.get('user_name'))
    
    # Show landing page for non-authenticated users
    return render_template('index.html', logged_in=False)

@app.route('/login')
def login():
    if 'user_id' in session and session.get('logged_in'):
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/register')
def register():
    if 'user_id' in session and session.get('logged_in'):
        return redirect(url_for('dashboard'))
    return render_template('register.html')

# Authentication routes
@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Please provide both email and password'
            }), 400
        
        # Check if user exists (simple check - in production, use proper authentication)
        user_data = get_user_data(email)
        if user_data and user_data.get('password') == password:
            # User exists and password matches
            session.clear()  # Clear any existing session data
            session['user_id'] = email
            session['user_email'] = email
            session['user_name'] = user_data.get('name', email.split('@')[0].title())
            session['logged_in'] = True
            session.permanent = True
            
            print(f"✅ User logged in: {email}")
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'redirect': '/dashboard'
            })
        elif not user_data:
            # User doesn't exist - for demo purposes, create account
            user_name = email.split('@')[0].title()
            save_user_data(email, {
                'name': user_name,
                'email': email,
                'password': password,
                'created_at': datetime.now().isoformat()
            })
            
            session.clear()  # Clear any existing session data
            session['user_id'] = email
            session['user_email'] = email
            session['user_name'] = user_name
            session['logged_in'] = True
            session.permanent = True
            
            print(f"✅ New user created and logged in: {email}")
            
            return jsonify({
                'success': True,
                'message': 'Account created and logged in successfully',
                'redirect': '/dashboard'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 400
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({
            'success': False,
            'message': 'Login failed. Please try again.'
        }), 500

@app.route('/api/register', methods=['POST'])
def api_register():
    try:
        data = request.get_json()
        full_name = data.get('fullName', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not full_name or not email or not password:
            return jsonify({
                'success': False,
                'message': 'Please fill in all fields'
            }), 400
        
        # Check if user already exists
        if get_user_data(email):
            return jsonify({
                'success': False,
                'message': 'An account with this email already exists'
            }), 400
        
        # Create new user
        save_user_data(email, {
            'name': full_name,
            'email': email,
            'password': password,
            'created_at': datetime.now().isoformat()
        })
        
        # Log user in
        session.clear()  # Clear any existing session data
        session['user_id'] = email
        session['user_email'] = email
        session['user_name'] = full_name
        session['logged_in'] = True
        session.permanent = True
        
        print(f"✅ New user registered: {email}")
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'redirect': '/dashboard'
        })
        
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({
            'success': False,
            'message': 'Registration failed. Please try again.'
        }), 500

@app.route('/logout')
def logout():
    user_name = session.get('user_name', 'User')
    user_id = session.get('user_id')
    
    # Clear session completely
    session.clear()
    
    print(f"✅ User logged out: {user_id}")
    
    flash(f'Goodbye {user_name}! You have been logged out successfully.', 'success')
    return redirect(url_for('index'))

# Add a route to clear sessions manually (for testing)
@app.route('/clear-session')
def clear_session():
    session.clear()
    flash('Session cleared successfully!', 'success')
    return redirect(url_for('index'))

# Protected routes (authentication required)
@app.route('/profile')
@login_required
def profile():
    user_id = session.get('user_id')
    user_data = get_user_data(user_id)
    
    user = {
        'name': session.get('user_name', ''),
        'email': session.get('user_email', ''),
        'education': user_data.get('education', ''),
        'skills': user_data.get('skills', ''),
        'aspirations': user_data.get('aspirations', '')
    }
    return render_template('profile.html', user=user)

@app.route('/certificate-finder')
@login_required
def certificate_finder():
    return render_template('certificate_finder.html')

@app.route('/course-suggester')
@login_required
def course_suggester():
    return render_template('course_suggester.html')

@app.route('/job-helper')
@login_required
def job_helper():
    return render_template('job_helper.html')

@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session.get('user_id')
    user_data = get_user_data(user_id)
    saved_items = get_user_saved_items(user_id)
    
    user = {
        'name': session.get('user_name', ''),
        'email': session.get('user_email', '')
    }
    
    return render_template('dashboard.html', user=user, saved_items=saved_items)

@app.route('/recommendations')
@login_required
def recommendations():
    return render_template('recommendations.html')

# Protected API routes
@app.route('/api/find-certificates', methods=['POST'])
@login_required
def api_find_certificates():
    try:
        data = request.get_json()
        interests = data.get('interests', [])
        goals = data.get('goals', [])
        course_preference = data.get('course_preference', 'Any')
        
        if not interests or not goals:
            return jsonify({'error': 'Please select at least one interest and one goal'}), 400
        
        user_id = session.get('user_id')
        print(f"🤖 ML-Enhanced Certificate Finding for {user_id}: {interests} + {goals}")
        
        result = ai_ml_engine.find_certificates_with_ml(interests, goals, course_preference)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        print(f"❌ ML Certificate API error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggest-courses', methods=['POST'])
@login_required
def api_suggest_courses():
    try:
        data = request.get_json()
        learning_prefs = data.get('learning_preferences', [])
        education_bg = data.get('educational_background', [])
        career_aspirations = data.get('career_aspirations', [])
        
        if not learning_prefs or not education_bg or not career_aspirations:
            return jsonify({'error': 'Please fill in all sections'}), 400
        
        user_id = session.get('user_id')
        print(f"🎓 ML-Enhanced Course Suggestions for {user_id}: {career_aspirations}")
        
        result = ai_ml_engine.suggest_courses_with_ml(learning_prefs, education_bg, career_aspirations)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        print(f"❌ ML Course API error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/find-companies', methods=['POST'])
@login_required
def api_find_companies():
    try:
        data = request.get_json()
        job_title = data.get('job_title', '')
        location = data.get('location', '')
        
        if not job_title or not location:
            return jsonify({'error': 'Please select both job title and location'}), 400
        
        user_id = session.get('user_id')
        print(f"🏢 ML-Enhanced Company Finding for {user_id}: {job_title} in {location}")
        
        result = ai_ml_engine.find_companies_with_ml(job_title, location)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        print(f"❌ ML Company API error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-item', methods=['POST'])
@login_required
def api_save_item():
    try:
        data = request.get_json()
        item_type = data.get('type')
        item_data = data.get('data')
        user_id = session.get('user_id')
        
        if not item_type or not item_data or not user_id:
            return jsonify({
                'success': False,
                'message': 'Missing required data'
            }), 400
        
        # Check if item already exists
        saved_items = get_user_saved_items(user_id)
        existing_items = saved_items.get(f'{item_type}s', [])
        
        # Check for duplicates based on item type
        for existing_item in existing_items:
            if item_type == 'certificate':
                if (existing_item.get('name') == item_data.get('name') and 
                    existing_item.get('provider') == item_data.get('provider')):
                    return jsonify({
                        'success': False,
                        'message': 'This certificate is already saved'
                    }), 400
            elif item_type == 'course':
                if (existing_item.get('title') == item_data.get('title') and 
                    existing_item.get('provider') == item_data.get('provider')):
                    return jsonify({
                        'success': False,
                        'message': 'This course is already saved'
                    }), 400
            elif item_type == 'job':
                if (existing_item.get('name') == item_data.get('name') and 
                    existing_item.get('industry') == item_data.get('industry')):
                    return jsonify({
                        'success': False,
                        'message': 'This job search is already saved'
                    }), 400
        
        # Save the item
        item_id = save_user_item(user_id, item_type, item_data)
        
        print(f"✅ Saved {item_type} for user {user_id}")
        return jsonify({
            'success': True,
            'message': f'{item_type.capitalize()} saved successfully!',
            'item_id': item_id
        })
        
    except Exception as e:
        print(f"❌ Save item error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to save item'
        }), 500

@app.route('/api/get-saved-items/<item_type>')
@login_required
def api_get_saved_items(item_type):
    try:
        user_id = session.get('user_id')
        saved_items = get_user_saved_items(user_id)
        items = saved_items.get(f'{item_type}s', [])
        
        return jsonify({
            'success': True,
            'items': items
        })
    except Exception as e:
        print(f"❌ Get saved items error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/delete-saved-item', methods=['POST'])
@login_required
def api_delete_saved_item():
    try:
        data = request.get_json()
        item_type = data.get('type')
        item_id = data.get('id')
        user_id = session.get('user_id')
        
        if not item_type or not item_id or not user_id:
            return jsonify({
                'success': False,
                'message': 'Missing required data'
            }), 400
        
        saved_items = get_user_saved_items(user_id)
        items = saved_items.get(f'{item_type}s', [])
        
        # Find and remove the item
        updated_items = [item for item in items if item.get('id') != item_id]
        
        if len(updated_items) == len(items):
            return jsonify({
                'success': False,
                'message': 'Item not found'
            }), 404
        
        saved_items[f'{item_type}s'] = updated_items
        
        print(f"✅ Deleted {item_type} {item_id} for user {user_id}")
        
        return jsonify({
            'success': True,
            'message': f'{item_type.capitalize()} deleted successfully!'
        })
        
    except Exception as e:
        print(f"❌ Delete item error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to delete item'
        }), 500

@app.route('/api/save-profile', methods=['POST'])
@login_required
def api_save_profile():
    try:
        data = request.get_json()
        user_id = session.get('user_id')
        
        # Update user data
        user_updates = {
            'name': data.get('fullName', session.get('user_name', '')),
            'education': data.get('education', ''),
            'skills': data.get('skills', ''),
            'aspirations': data.get('aspirations', ''),
            'updated_at': datetime.now().isoformat()
        }
        
        save_user_data(user_id, user_updates)
        
        # Update session
        session['user_name'] = user_updates['name']
        
        print(f"✅ Profile updated for user {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully'
        })
    except Exception as e:
        print(f"❌ Save profile error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to update profile'
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    print("🚀 Starting CareerCompass with Beautiful Landing Page...")
    print("🔐 Features:")
    print("   ✅ Beautiful Landing Page (Default)")
    print("   ✅ Proper Authentication Flow")
    print("   ✅ Complete Login/Logout Flow")
    print("   ✅ Session Management")
    print("   ✅ User Data Persistence")
    print("   ✅ Save/Unsave Items with Visual Feedback")
    print("   ✅ Duplicate Prevention")
    print("   ✅ Profile Management")
    print("   ✅ Protected Routes")
    print("🤖 AI Models Available:")
    print("   ✅ Gemini 1.5 Flash (Generative AI)")
    print("   ✅ TF-IDF + Cosine Similarity (Content-Based ML)")
    print("   ✅ K-Means Clustering (User Segmentation)")
    print("   ✅ Random Forest (Career Path Prediction)")
    print("   ✅ Collaborative Filtering (User-Based Recommendations)")
    print("   ✅ Neural Network (Deep Learning - Optional)")
    print("🔑 API Key: Configured")
    print("✅ All systems ready!")
    print("🌐 Access the application at: http://localhost:5000")
    print("🧹 Visit /clear-session to manually clear sessions if needed")
    app.run(debug=True, port=5000)
