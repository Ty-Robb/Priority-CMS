# This file makes the db directory a Python package
# It allows imports like "from db.firestore import firestore_db"

from .firestore import firestore_db

__all__ = ['firestore_db']
