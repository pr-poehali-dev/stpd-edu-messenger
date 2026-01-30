import json
import os
import base64
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

def handler(event: dict, context) -> dict:
    '''API для управления профилем: обновление аватарки и данных'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ['DATABASE_URL']
    schema = os.environ['MAIN_DB_SCHEMA']
    
    conn = psycopg2.connect(db_url, options=f'-c search_path={schema}')
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            user_id = body.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            if action == 'upload_avatar':
                avatar_base64 = body.get('avatar_base64')
                
                if not avatar_base64:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'avatar_base64 обязателен'}),
                        'isBase64Encoded': False
                    }
                
                s3 = boto3.client('s3',
                    endpoint_url='https://bucket.poehali.dev',
                    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
                )
                
                avatar_data = base64.b64decode(avatar_base64.split(',')[1] if ',' in avatar_base64 else avatar_base64)
                
                file_key = f'avatars/user_{user_id}.jpg'
                
                s3.put_object(
                    Bucket='files',
                    Key=file_key,
                    Body=avatar_data,
                    ContentType='image/jpeg'
                )
                
                avatar_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
                
                cur.execute(
                    "UPDATE users SET avatar_url = %s WHERE id = %s RETURNING id, username, role, class_number, class_letter, avatar_url",
                    (avatar_url, user_id)
                )
                user = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'user': dict(user)
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'update_profile':
                class_number = body.get('class_number')
                class_letter = body.get('class_letter', '').strip().upper() if body.get('class_letter') else None
                
                cur.execute(
                    "UPDATE users SET class_number = %s, class_letter = %s WHERE id = %s RETURNING id, username, role, class_number, class_letter, avatar_url",
                    (class_number, class_letter, user_id)
                )
                user = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'user': dict(user)
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "SELECT id, username, role, class_number, class_letter, avatar_url FROM users WHERE id = %s",
                (user_id,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь не найден'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user)
                }),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }