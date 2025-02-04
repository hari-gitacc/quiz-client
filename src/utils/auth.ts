// frontend/src/utils/auth.ts
export const getUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        // JWT tokens are split by dots - take the middle part (payload)
        const base64Payload = token.split('.')[1];
        // Convert base64 to JSON
        const payload = JSON.parse(atob(base64Payload));
        // console.log('Decoded token:', payload);
        
        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};