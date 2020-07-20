"""djangoreactproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from customers import views as customers_views
from admins import views as admins_views
from django.conf.urls import url


urlpatterns = [
    path('admin/', admin.site.urls),
    #搜索
    url(r'^api/customers/$', customers_views.customers_list),
    url(r'^api/customers/(?P<pk>[0-9]+)$', customers_views.customers_detail),   
    url(r'^api/customers/search/', customers_views.Search), 
    #数据源
    url(r'^api/admin/add/datasource/', admins_views.admin_add_source),
    url(r'^api/admin/delete/datasource/', admins_views.admin_delete_source),
    url(r'^api/admin/getallsource/', admins_views.admin_get_all_sources),
    url(r'^api/admin/update/datasource/', admins_views.admin_update_source),
    url(r'^api/admin/search/url/', admins_views.admin_search_by_url),
    #书籍信息
    url(r'^api/admin/add/book/', admins_views.admin_add_book),
    url(r'^api/admin/searchbooks/', admins_views.admin_search_books),
    url(r'^api/admin/searchbytitle/', admins_views.admin_search_by_title),
    url(r'^api/admin/searchbyid/', admins_views.admin_search_by_id),
    url(r'^api/admin/delete/book/', admins_views.admin_delete_book),
    url(r'^api/admin/delete/books/', admins_views.admin_delete_books),
    url(r'^api/admin/update/', admins_views.admin_update_book),
    url(r'^api/admin/getallbooks/', admins_views.admin_get_all_books),
    #登录登出
    url(r'^api/users/logout/', admins_views.admin_logout),
    url(r'^api/users/login/', admins_views.admin_login),
]
