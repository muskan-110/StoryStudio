#!/usr/bin/env python3
"""
Debug script to test API keys and services
"""
import os
from dotenv import load_dotenv

def check_environment():
    """Check if all required environment variables are set"""
    load_dotenv()
    
    print("🔍 Checking environment variables...")
    
    cohere_key = os.getenv("COHERE_API_KEY")
    stability_key = os.getenv("STABILITY_API_KEY")
    
    print(f"COHERE_API_KEY: {'✅ SET' if cohere_key else '❌ NOT SET'}")
    print(f"STABILITY_API_KEY: {'✅ SET' if stability_key else '❌ NOT SET'}")
    
    if not cohere_key:
        print("❌ COHERE_API_KEY is required for story generation")
        return False
        
    if not stability_key:
        print("❌ STABILITY_API_KEY is required for image generation")
        return False
        
    print("✅ All required API keys are set!")
    return True

def test_cohere():
    """Test Cohere API connection"""
    try:
        from services.story_service import generate_story
        print("\n🧪 Testing Cohere API...")
        
        result = generate_story("A brave knight", "fantasy", "adventurous", "children", 50, 0.8)
        
        if result.startswith("Error"):
            print(f"❌ Cohere API test failed: {result}")
            return False
        else:
            print(f"✅ Cohere API test successful!")
            print(f"Generated text preview: {result[:100]}...")
            return True
            
    except Exception as e:
        print(f"❌ Cohere API test failed with exception: {str(e)}")
        return False

def test_stability():
    """Test Stability AI API connection"""
    try:
        from services.image_service import generate_image
        print("\n🧪 Testing Stability AI API...")
        
        result = generate_image("a brave knight", 1)
        
        if result.startswith("Error"):
            print(f"❌ Stability AI API test failed: {result}")
            return False
        else:
            print(f"✅ Stability AI API test successful!")
            print(f"Generated image data length: {len(result)} characters")
            return True
            
    except Exception as e:
        print(f"❌ Stability AI API test failed with exception: {str(e)}")
        return False

def main():
    print("🚀 API Debug Script")
    print("=" * 50)
    
    # Check environment
    if not check_environment():
        print("\n❌ Environment check failed. Please set up your .env file.")
        return
    
    # Test APIs
    cohere_ok = test_cohere()
    stability_ok = test_stability()
    
    print("\n" + "=" * 50)
    print("📊 Summary:")
    print(f"Cohere API: {'✅ Working' if cohere_ok else '❌ Failed'}")
    print(f"Stability AI API: {'✅ Working' if stability_ok else '❌ Failed'}")
    
    if cohere_ok and stability_ok:
        print("\n🎉 All APIs are working! Your story generation should work now.")
    else:
        print("\n⚠️  Some APIs are not working. Check the errors above.")

if __name__ == "__main__":
    main()