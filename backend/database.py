"""
Database module for user storage using SQLite
"""
import sqlite3
import hashlib
import secrets
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "quantara.db"


def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database with users table"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    
    # Create user_progress table for tracking user progress
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            challenge_id TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            points_earned INTEGER DEFAULT 0,
            best_circuit TEXT,
            completed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create circuit_designs table for saving user circuit designs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS circuit_designs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            gates TEXT NOT NULL,
            num_qubits INTEGER DEFAULT 1,
            is_public BOOLEAN DEFAULT 0,
            shared_id TEXT UNIQUE,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create user_settings table for storing user preferences
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            theme TEXT DEFAULT 'dark',
            show_hints BOOLEAN DEFAULT 1,
            autosave_enabled BOOLEAN DEFAULT 1,
            autosave_interval INTEGER DEFAULT 30000,
            notifications_enabled BOOLEAN DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    conn.commit()
    conn.close()


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}${password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, password_hash = stored_hash.split("$")
        computed_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return computed_hash == password_hash
    except Exception:
        return False


def create_user(username: str, email: str, password: str) -> dict:
    """Create a new user"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check if username or email already exists
        cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
        if cursor.fetchone():
            return {"success": False, "error": "Username or email already exists"}
        
        # Hash password and create user
        password_hash = hash_password(password)
        now = datetime.utcnow().isoformat()
        
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (username, email, password_hash, now, now)
        )
        
        conn.commit()
        user_id = cursor.lastrowid
        
        return {
            "success": True,
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


def authenticate_user(email: str, password: str) -> dict:
    """Authenticate user with email and password"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, username, email, password_hash FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        
        if not row:
            return {"success": False, "error": "Invalid email or password"}
        
        if not verify_password(password, row["password_hash"]):
            return {"success": False, "error": "Invalid email or password"}
        
        return {
            "success": True,
            "user": {
                "id": row["id"],
                "username": row["username"],
                "email": row["email"]
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


def get_user_by_id(user_id: int) -> dict:
    """Get user by ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        
        if not row:
            return {"success": False, "error": "User not found"}
        
        return {
            "success": True,
            "user": {
                "id": row["id"],
                "username": row["username"],
                "email": row["email"],
                "created_at": row["created_at"]
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


# ============================================================================
# USER PROGRESS FUNCTIONS
# ============================================================================

def save_user_progress(user_id: int, challenge_id: str, completed: bool = False, 
                   points_earned: int = 0, best_circuit: str = None) -> dict:
    """Save or update user progress for a challenge"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        now = datetime.utcnow().isoformat()
        
        # Check if progress exists
        cursor.execute(
            "SELECT id, points_earned FROM user_progress WHERE user_id = ? AND challenge_id = ?",
            (user_id, challenge_id)
        )
        existing = cursor.fetchone()
        
        if existing:
            # Update existing progress
            cursor.execute("""
                UPDATE user_progress 
                SET completed = ?, points_earned = ?, best_circuit = ?, updated_at = ?
                WHERE user_id = ? AND challenge_id = ?
            """, (completed, points_earned, best_circuit, now, user_id, challenge_id))
        else:
            # Insert new progress
            cursor.execute("""
                INSERT INTO user_progress 
                (user_id, challenge_id, completed, points_earned, best_circuit, completed_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, challenge_id, completed, points_earned, best_circuit, 
                  now if completed else None, now, now))
        
        conn.commit()
        
        return {"success": True, "message": "Progress saved"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


def get_user_progress(user_id: int) -> dict:
    """Get all progress for a user"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT challenge_id, completed, points_earned, best_circuit, completed_at, updated_at
            FROM user_progress WHERE user_id = ? ORDER BY updated_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        
        progress = {}
        for row in rows:
            progress[row['challenge_id']] = {
                'completed': row['completed'],
                'points_earned': row['points_earned'],
                'best_circuit': row['best_circuit'],
                'completed_at': row['completed_at'],
                'updated_at': row['updated_at']
            }
        
        return {"success": True, "progress": progress}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


# ============================================================================
# CIRCUIT DESIGN FUNCTIONS
# ============================================================================

def save_circuit_design(user_id: int, name: str, gates: list, description: str = '',
                      num_qubits: int = 1, is_public: bool = False, design_id: int = None) -> dict:
    """Save a circuit design"""
    import json
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        now = datetime.utcnow().isoformat()
        gates_json = json.dumps(gates)
        
        if design_id:
            # Update existing design
            cursor.execute("""
                UPDATE circuit_designs
                SET name = ?, description = ?, gates = ?, num_qubits = ?, is_public = ?, updated_at = ?
                WHERE id = ? AND user_id = ?
            """, (name, description, gates_json, num_qubits, is_public, now, design_id, user_id))
            conn.commit()
            return {"success": True, "message": "Design updated", "design_id": design_id}
        else:
            # Insert new design
            cursor.execute("""
                INSERT INTO circuit_designs
                (user_id, name, description, gates, num_qubits, is_public, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, name, description, gates_json, num_qubits, is_public, now, now))
            conn.commit()
            design_id = cursor.lastrowid
            return {"success": True, "message": "Design saved", "design_id": design_id}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


def get_circuit_design(design_id: int, user_id: int = None) -> dict:
    """Get a circuit design by ID"""
    import json
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        if user_id:
            cursor.execute("""
                SELECT id, user_id, name, description, gates, num_qubits, is_public, created_at, updated_at
                FROM circuit_designs WHERE id = ? AND user_id = ?
            """, (design_id, user_id))
        else:
            cursor.execute("""
                SELECT id, user_id, name, description, gates, num_qubits, is_public, created_at, updated_at
                FROM circuit_designs WHERE id = ?
            """, (design_id,))
        
        row = cursor.fetchone()
        
        if not row:
            return {"success": False, "error": "Design not found"}
        
        return {
            "success": True,
            "design": {
                "id": row['id'],
                "user_id": row['user_id'],
                "name": row['name'],
                "description": row['description'],
                "gates": json.loads(row['gates']),
                "num_qubits": row['num_qubits'],
                "is_public": row['is_public'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            }
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


def get_user_circuit_designs(user_id: int) -> dict:
    """Get all circuit designs for a user"""
    import json
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, name, description, gates, num_qubits, is_public, created_at, updated_at
            FROM circuit_designs WHERE user_id = ? ORDER BY updated_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        
        designs = []
        for row in rows:
            designs.append({
                "id": row['id'],
                "name": row['name'],
                "description": row['description'],
                "gates": json.loads(row['gates']),
                "num_qubits": row['num_qubits'],
                "is_public": row['is_public'],
                "created_at": row['created_at'],
                "updated_at": row['updated_at']
            })
        
        return {"success": True, "designs": designs}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


def delete_circuit_design(design_id: int, user_id: int) -> dict:
    """Delete a circuit design"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM circuit_designs WHERE id = ? AND user_id = ?", 
                       (design_id, user_id))
        conn.commit()
        
        if cursor.rowcount == 0:
            return {"success": False, "error": "Design not found"}
        
        return {"success": True, "message": "Design deleted"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


# ============================================================================
# USER SETTINGS FUNCTIONS
# ============================================================================

def get_user_settings(user_id: int) -> dict:
    """Get user settings"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT theme, show_hints, autosave_enabled, autosave_interval, 
                   notifications_enabled FROM user_settings WHERE user_id = ?
        """, (user_id,))
        row = cursor.fetchone()
        
        if not row:
            # Create default settings
            now = datetime.utcnow().isoformat()
            cursor.execute("""
                INSERT INTO user_settings (user_id, theme, show_hints, autosave_enabled,
                autosave_interval, notifications_enabled, created_at, updated_at)
                VALUES (?, 'dark', 1, 1, 30000, 1, ?, ?)
            """, (user_id, now, now))
            conn.commit()
            
            return {
                "success": True,
                "settings": {
                    "theme": "dark",
                    "show_hints": True,
                    "autosave_enabled": True,
                    "autosave_interval": 30000,
                    "notifications_enabled": True
                }
            }
        
        return {
            "success": True,
            "settings": {
                "theme": row['theme'],
                "show_hints": bool(row['show_hints']),
                "autosave_enabled": bool(row['autosave_enabled']),
                "autosave_interval": row['autosave_interval'],
                "notifications_enabled": bool(row['notifications_enabled'])
            }
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


def update_user_settings(user_id: int, settings: dict) -> dict:
    """Update user settings"""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        now = datetime.utcnow().isoformat()
        
        # Check if settings exist
        cursor.execute("SELECT id FROM user_settings WHERE user_id = ?", (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update
            cursor.execute("""
                UPDATE user_settings SET
                theme = COALESCE(?, theme),
                show_hints = COALESCE(?, show_hints),
                autosave_enabled = COALESCE(?, autosave_enabled),
                autosave_interval = COALESCE(?, autosave_interval),
                notifications_enabled = COALESCE(?, notifications_enabled),
                updated_at = ?
                WHERE user_id = ?
            """, (
                settings.get('theme'),
                settings.get('show_hints'),
                settings.get('autosave_enabled'),
                settings.get('autosave_interval'),
                settings.get('notifications_enabled'),
                now, user_id
            ))
        else:
            # Insert
            cursor.execute("""
                INSERT INTO user_settings
                (user_id, theme, show_hints, autosave_enabled, autosave_interval,
                 notifications_enabled, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                settings.get('theme', 'dark'),
                settings.get('show_hints', 1),
                settings.get('autosave_enabled', 1),
                settings.get('autosave_interval', 30000),
                settings.get('notifications_enabled', 1),
                now, now
            ))
        
        conn.commit()
        return {"success": True, "message": "Settings updated"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()


# Initialize database on import
init_db()
