from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.core import signing
from django.core.cache import cache
from .models import Admin, DataSource, Books
import time
import hashlib
import json

HEADER = {'typ': 'JWP', 'alg': 'default'}
KEY = 'G26'
SALT = 'shuchong'
TIME_OUT = 30 * 60  # 30min

# Create your views here.

@api_view(['POST'])
def admin_login(request):
    """
        管理员登录
        args:
            {'email': 'email', 'password': 'password'}
        return:
            {'state': False, 'message': 'name','authorizeToken':''}
    """
    response = {'state': False, 'message': '','authorizeToken':''}
    body = str(request.body,encoding='utf-8')
    info = json.loads(body)#解析json报文
    email = info['email']
    password = info['password']
    # 查询该用户
    users = Admin.objects.filter(email=email)
    if len(users) != 1:
        response['state'] = False
        response['message'] = "用户名或密码错误"
    else:
        user = users.first()
        if user.password != password:
            response['state'] = False
            response['message'] = "用户名或密码错误"
        else:
            userName = user.user_name
            response['state'] = True
            response['message'] = userName
            response['authorizeToken'] = create_token(userName)
    return JsonResponse(response)


@api_view(['POST'])
def admin_logout(request):
    """
        管理员登出
        args:
            {}
        return:
            {'state': False}
    """
    response = {'state': False}
    body = str(request.body,encoding='utf-8')
    info = json.loads(body)#解析json报文
    token = request.META.get("HTTP_TOKEN")
    if check_token(token):
        userName = get_username(token)
        cache.delete(userName)
        response['state'] = True
    return JsonResponse(response)


@api_view(['POST'])
def admin_get_all_sources(request):
    """
        获取所有数据源
        args:
            {}
        return:
            {code: 1, data: []}
    """
    response = {'code': 1, 'data': []}
    sources = DataSource.objects.values().all()
    response['data'] = list(sources)
    return  JsonResponse(response)

@api_view(['POST'])
def admin_add_source(request):
    """
        添加数据源
        args:
            {'name': 'name', 'url': 'url'}
        return:
            {'state': False}
    """
    response = {'state': False}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)#解析json报文
        name = info['name']
        url = info['url']
        dataSourse = DataSource(name=name, url=url)
        dataSourse.save()
        response['state'] = True
    return JsonResponse(response)

@api_view(['POST'])
def admin_delete_source(request):
    """
        删除数据源
        args:
            {'id': id}
        return:
            {'state': False}
    """
    response = {'state': False}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)#解析json报文
        id = info['id']
        sources = DataSource.objects.filter(id=id)
        if len(sources) == 1:
            DataSource.objects.get(id=id).delete()
            response['state'] = True
    return JsonResponse(response)

@api_view(['POST'])
def admin_update_source(request):
    """
        更新数据源
        args:
            {'id': id，'url': 'url'}
        return:
            {'state': False}
    """
    response = {'state': False}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)#解析json报文
        id = info['id']
        url = info['url']
        source = DataSource.objects.get(id=id)
        source.url = url
        source.save()
        response['state'] = True
    return JsonResponse(response)

@api_view(['POST'])
def admin_search_by_url(request):
    """
        根据url查询数据源
        args:
            {'url': 'url'}
        return:
            {'state': False， 'data': []}
    """
    response = {'code': 1, 'data': []}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)#解析json报文
        url = info['url']
        sources = DataSource.objects.values().filter(url=url)
        if url == "":
            sources = DataSource.objects.values().all()
        response['data'] = list(sources)
        response['state'] = True
    
    return  JsonResponse(response)

@api_view(['POST'])
def admin_get_all_books(request):
    """
        返回所有书籍(最多100条信息)
        args:
            {'title': 'title', 'description': 'description', 'host': 'host', 
            'link': 'link', 'rate_sumary': rate_summary}
        return:
            {'state': False}
    """
    response = {'state': False, 'result': []}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)
        books = Books.objects.values().all()[0:100]
        response['state'] = True
        response['result'] = list(books)
        response['total'] = len(books)
    return JsonResponse(response)


@api_view(['POST'])
def admin_search_books(request):
    """
        查询书籍
        args:
            {
                title: title,
                type: type, (""-all, 1-pdf, 2-txt, 3-doc)
                begin: begin,
                end: end
            }
        return:
            {'state': False, result: []}
    """  
    response = {'state': False}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)

        types = ["%", "pdf", "txt", "doc"]
        """参数"""
        title = info["title"]
        type = info['type']
        begin = info['begin']
        end = info['end']
    
        books = {}
        if title != "":
            if type != "":
                books = list(Books.objects.values().filter(title__icontains=title, type=types[int(type)]))
            else:
                books = list(Books.objects.values().filter(title__icontains=title))
        else:
            if type != "":
                books = list(Books.objects.values().filter(type=types[int(type)]))
            else:
                books = list(Books.objects.values().all())
        
        response['result'] = books
        response['state'] = True
        response['total'] = len(books)
    return  JsonResponse(response)

@api_view(['POST'])
def admin_add_book(request):
    """
        添加书籍信息
        args:
            {'title': 'title', 'description': 'description', 'host': 'host', 
            'link': 'link', 'rate_sumary': rate_summary}
        return:
            {'state': False}
    """
    response = {'state': False}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)
        title = info['title']
        description = info['description']
        host = info['host']
        link = info['link']
        rate_summary = info['rate_summary']
        """插入数据库"""
        book = Books(title=title, description=description, host=host, link=link, rate_summary=rate_summary)
        book.save()
        response['state'] = True
    return JsonResponse(response)

@api_view(['POST'])
def admin_delete_book(request):
    """
        根据id删除一本书
        args:
            {'id': id}
        return:
            {'state': False}
    """
    response = {'state': False}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)
        id_delete = info['id']
        Books.objects.get(book_id=id_delete).delete()
        response['state'] = True
    return JsonResponse(response)

@api_view(['POST'])
def admin_delete_books(request):
    """
        根据id批量删除
        args:
            {'id': []}
        return:
            {'state': False}
    """
    response = {'state': False}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)
        id_delete = info['id']
        for id in id_delete:
            Books.objects.get(book_id=id).delete()
        response['state'] = True
    return JsonResponse(response)

@api_view(['POST'])
def admin_search_by_title(request):
    """
        根据title查询书籍
        args:
            {'title': 'title'}
        return:
            {'state': False, 'result': []}
    """
    response = {'state': False, 'result': []}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)
        title = info['title']
        books = Books.objects.values().filter(title=title)
        response['state'] = True
        response['result'] = list(books)
    return JsonResponse(response)

@api_view(['POST'])
def admin_search_by_id(request):
    """
        根据id查询书籍
        args:
            {'id': id}
        return:
            {'state': False, 'result': []}
    """
    response = {'state': False, 'result': []}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)
        book_id = info['id']
        book = Books.objects.values().filter(book_id=book_id)
        response['state'] = True
        response['result'] = list(book)
    return JsonResponse(response)

@api_view(['POST'])
def admin_update_book(request):
    """
        根据id修改数据信息，若某一参数为空，则不修改该参数
        args:
            {'id': id, 'title': 'title', 'description': 'description', 
            'host': 'host', 'link': 'link', 'rate_sumary': rate_summary}
        return:
            {'state': False, 'result': []}
    """
    response = {'state': False}
    token = request.META.get('HTTP_TOKEN')
    if check_token(token):
        body = str(request.body,encoding='utf-8')
        info = json.loads(body)
        id = info['id']
        new_title = info['title']
        new_description = info['description']
        new_host = info['host']
        new_link = info['link']
        new_rate_summary = info['rate_summary']
        """更新"""
        book = Books.objects.get(book_id=id)
        if new_title != "" and new_title != None:
            book.title = new_title
        if new_description != "" and new_description != None:
            book.description = new_description
        if new_host != "" and new_host != None:
            book.host = new_host
        if new_link != "" and new_link != None:
            book.link = new_link
        if (type(new_rate_summary).__name__ == 'int' or type(new_rate_summary).__name__ == 'float') and new_rate_summary != None:
            book.rate_summary = new_rate_summary
        book.save()
        response['state'] = True
    return JsonResponse(response)

def encrypt(obj):
    """加密"""
    value = signing.dumps(obj, key=KEY, salt=SALT)
    value = signing.b64_encode(value.encode()).decode()
    return value


def decrypt(src):
    """解密"""
    src = signing.b64_decode(src.encode()).decode()
    raw = signing.loads(src, key=KEY, salt=SALT)
    print(type(raw))
    return raw


def create_token(username):
    """生成token信息"""
    # 1. 加密头信息
    header = encrypt(HEADER)
    # 2. 构造Payload
    payload = {"username": username, "iat": time.time()}
    payload = encrypt(payload)
    # 3. 生成签名
    md5 = hashlib.md5()
    md5.update(("%s.%s" % (header, payload)).encode())
    signature = md5.hexdigest()
    token = "%s.%s.%s" % (header, payload, signature)
    # 存储到缓存中
    cache.set(username, token, TIME_OUT)
    return token


def get_payload(token):
    payload = str(token).split('.')[1]
    payload = decrypt(payload)
    return payload


# 通过token获取用户名
def get_username(token):
    payload = get_payload(token)
    return payload['username']
    pass


def check_token(token):
    return True
    username = get_username(token)
    last_token = cache.get(username)
    
    if last_token:
        return last_token == token
    return False

