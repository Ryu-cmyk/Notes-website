from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    - Everyone : can view (GET, HEAD, OPTIONS)
    - Admin only: can create, update, delete
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsAuthenticatedForDownload(permissions.BasePermission):
    """
    - Everyone        : can list and retrieve
    - Authenticated   : can download (login required)
    - Admin only      : can create, update, delete
    """

    def has_permission(self, request, view):
        # Anyone can browse
        if view.action in ['list', 'retrieve']:
            return True

        # Must be logged in to download
        if view.action == 'download':
            return request.user and request.user.is_authenticated

        # Everything else (create, update, partial_update, destroy) — admin only
        return request.user and request.user.is_staff