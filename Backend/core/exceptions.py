from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Custom exception handler"""
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': str(exc),
            'status_code': response.status_code
        }
        
        if hasattr(response, 'data'):
            custom_response_data['details'] = response.data
        
        response.data = custom_response_data
        
        # Log the error
        logger.error(f"API Error: {exc} - Status: {response.status_code}")
    
    return response