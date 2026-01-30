import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для отправки и получения сообщений между пользователями'''
    
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
            sender_id = body.get('sender_id')
            receiver_id = body.get('receiver_id')
            message = body.get('message', '').strip()
            
            if not sender_id or not receiver_id or not message:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'sender_id, receiver_id и message обязательны'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "INSERT INTO messages (sender_id, receiver_id, message) VALUES (%s, %s, %s) RETURNING id, sender_id, receiver_id, message, created_at",
                (sender_id, receiver_id, message)
            )
            new_message = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': dict(new_message)
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            user_id = query_params.get('user_id')
            other_user_id = query_params.get('other_user_id')
            action = query_params.get('action')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id обязателен'}),
                    'isBase64Encoded': False
                }
            
            if action == 'conversations':
                cur.execute("""
                    SELECT DISTINCT ON (other_user_id)
                        CASE 
                            WHEN sender_id = %s THEN receiver_id 
                            ELSE sender_id 
                        END as other_user_id,
                        u.username,
                        u.role,
                        u.class_number,
                        u.class_letter,
                        u.avatar_url,
                        m.message as last_message,
                        m.created_at as last_message_time,
                        (SELECT COUNT(*) FROM messages WHERE 
                            sender_id = other_user_id AND receiver_id = %s) as unread_count
                    FROM messages m
                    JOIN users u ON u.id = CASE 
                        WHEN m.sender_id = %s THEN m.receiver_id 
                        ELSE m.sender_id 
                    END
                    WHERE sender_id = %s OR receiver_id = %s
                    ORDER BY other_user_id, m.created_at DESC
                """, (user_id, user_id, user_id, user_id, user_id))
                
                conversations = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'conversations': [dict(c) for c in conversations]
                    }),
                    'isBase64Encoded': False
                }
            
            elif other_user_id:
                cur.execute("""
                    SELECT m.id, m.sender_id, m.receiver_id, m.message, m.created_at,
                           u.username as sender_username, u.avatar_url as sender_avatar
                    FROM messages m
                    JOIN users u ON u.id = m.sender_id
                    WHERE (m.sender_id = %s AND m.receiver_id = %s) 
                       OR (m.sender_id = %s AND m.receiver_id = %s)
                    ORDER BY m.created_at ASC
                    LIMIT 100
                """, (user_id, other_user_id, other_user_id, user_id))
                
                messages = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'messages': [dict(m) for m in messages]
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
        'statusCode': 400,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Invalid request'}),
        'isBase64Encoded': False
    }