from flask import Flask, render_template, jsonify, request
import os
from database.models import NanoBananaDatabase
from database.user_model import UserModel
from config import DATABASE_PATH

app = Flask(__name__)

# Initialize database connections
db = NanoBananaDatabase(DATABASE_PATH)
user_db = UserModel(DATABASE_PATH)

@app.route('/')
def index():
    # Get all prompts from database
    prompts = db.get_all_prompts()
    
    # Format the prompts for the template
    formatted_prompts = []
    for prompt in prompts:
        formatted_prompts.append({
            'id': prompt['id'],
            'title': prompt['title'],
            'description': prompt['description'] or prompt['title'],
            'prompt_text': prompt['prompt_text'],
            'author': prompt['author'],
            'date': prompt['created_at'].split('T')[0] if prompt['created_at'] else 'Unknown',
            'category': prompt.get('category', 'Uncategorized'),
            'source_url': prompt.get('source_url', '#'),
            'image_url': prompt.get('image_url', '')
        })
    
    return render_template('index.html', prompts=formatted_prompts)

@app.route('/api/prompts')
def get_prompts():
    prompts = db.get_all_prompts()
    return jsonify(prompts)

@app.route('/prompt/<int:prompt_id>')
def prompt_detail(prompt_id):
    # Get all prompts and find the one with matching ID
    prompts = db.get_all_prompts()
    prompt = next((p for p in prompts if p['id'] == prompt_id), None)
    
    if prompt:
        formatted_prompt = {
            'id': prompt['id'],
            'title': prompt['title'],
            'description': prompt['description'] or prompt['title'],
            'prompt_text': prompt['prompt_text'],
            'author': prompt['author'],
            'date': prompt['created_at'].split('T')[0] if prompt['created_at'] else 'Unknown',
            'category': prompt.get('category', 'Uncategorized'),
            'source_url': prompt.get('source_url', '#'),
            'source_type': prompt.get('source_type', 'unknown'),
            'image_url': prompt.get('image_url', '')  # Add this line
        }
        return render_template('prompt_detail.html', prompt=formatted_prompt)
    return "Prompt not found", 404

@app.route('/api/subscribe-to-nano-gallery', methods=['POST'])
def subscribe_to_nano_gallery():
    """Handle subscription to Nano Banana Gallery"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        email = data.get('email')
        subscribe = data.get('subscribe', True)
        
        if not user_id or not email:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: user_id and email are required'
            }), 400
        
        # Create or update user
        user_db.create_or_update_user(user_id, email)
        
        # Update subscription status
        success = user_db.update_subscription_status(user_id, subscribe)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Successfully {'subscribed to' if subscribe else 'unsubscribed from'} Nano Banana Gallery',
                'subscribed': subscribe
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to update subscription status'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error processing subscription: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Create necessary directories if they don't exist
    os.makedirs('templates', exist_ok=True)
    
    # Create index.html if it doesn't exist
    if not os.path.exists('templates/index.html'):
        with open('templates/index.html', 'w') as f:
            f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Gallery</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-12">
            <h1 class="text-4xl font-bold text-indigo-700 mb-2">Prompt Gallery</h1>
            <p class="text-gray-600">Explore and discover creative prompts</p>
        </header>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {% for prompt in prompts %}
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img src="{{ prompt.image_url }}" alt="{{ prompt.title }}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-indigo-600 font-semibold">{{ prompt.category }}</span>
                        {% if prompt.featured %}
                        <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
                        {% endif %}
                    </div>
                    <h2 class="text-xl font-bold text-gray-800 mb-2">{{ prompt.title }}</h2>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ prompt.description }}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">By {{ prompt.author }}</span>
                        <a href="/prompt/{{ prompt.id }}" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View Details →</a>
                    </div>
                </div>
            </div>
            {% endfor %}
        </div>
    </div>
</body>
</html>""")
    
    # Create prompt_detail.html if it doesn't exist
    if not os.path.exists('templates/prompt_detail.html'):
        with open('templates/prompt_detail.html', 'w') as f:
            f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ prompt.title }} - Prompt Details</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-3xl mx-auto">
            <a href="/" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
                ← Back to Gallery
            </a>
            
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <img src="{{ prompt.image_url }}" alt="{{ prompt.title }}" class="w-full h-64 object-cover">
                <div class="p-8">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-sm text-indigo-600 font-semibold">{{ prompt.category }}</span>
                        {% if prompt.featured %}
                        <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Featured</span>
                        {% endif %}
                    </div>
                    
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ prompt.title }}</h1>
                    <p class="text-gray-600 mb-6">{{ prompt.description }}</p>
                    
                    <div class="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 class="text-sm font-medium text-gray-500 mb-2">Prompt Text</h3>
                        <div class="bg-white p-4 rounded border border-gray-200 font-mono text-sm">
                            {{ prompt.prompt_text }}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-gray-500">
                        <span>By {{ prompt.author }} • {{ prompt.date }}</span>
                        {% if prompt.original %}
                        <span class="text-green-600">✓ Original Content</span>
                        {% endif %}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>""")
    
    # Run the Flask app
    app.run(debug=True, port=5000)
