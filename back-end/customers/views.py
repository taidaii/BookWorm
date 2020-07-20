from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.shortcuts import HttpResponse
from django.http import JsonResponse

from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Customer 
from .serializers import *
from admins.models import Books
import time
import datetime
import json
import requests
import re


@api_view(['GET', 'POST'])
def customers_list(request):
    """
 List  customers, or create a new customer.
 """
    #print("list")
    if request.method == 'GET':
        data = []
        nextPage = 1
        previousPage = 1
        customers = Customer.objects.all()
        page = request.GET.get('page', 1)
        paginator = Paginator(customers, 5)
        try:
            data = paginator.page(page)
        except PageNotAnInteger:
            data = paginator.page(1)
        except EmptyPage:
            data = paginator.page(paginator.num_pages)

        serializer = CustomerSerializer(data,context={'request': request} ,many=True)
        if data.has_next():
            nextPage = data.next_page_number()
        if data.has_previous():
            previousPage = data.previous_page_number()
        #print("get function")
        return Response({'data': serializer.data , 'count': paginator.count, 'numpages' : paginator.num_pages, 'nextlink': '/api/customers/?page=' + str(nextPage), 'prevlink': '/api/customers/?page=' + str(previousPage)})

    elif request.method == 'POST':
        #print("create the customer")
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def customers_detail(request, pk):
    """
 Retrieve, update or delete a customer by id/pk.
 """
    print("detail?")
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CustomerSerializer(customer,context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CustomerSerializer(customer, data=request.data,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
@api_view(['POST'])
def Search(request):
    """
 Search operation and return json data.
 """
    response = {'code': 0, 'msg': 'success','state':'true','result':[]}
    #print("the query is")
    #print(query)

    
    body=str(request.body,encoding='utf-8')
    info = json.loads(body)#解析json报文
    query = info.get("searchValue")


    """Try to find in database"""
    access_start = datetime.datetime.now()
    books = list(Books.objects.values().filter(title__icontains=query)[0:50])
    access_end = datetime.datetime.now()
    print(query, 'From database', access_end-access_start) 

    if len(books) >= 20:
        for book in books:
            book['des'] = book['description']
        response['result'] = books
        response['count'] = len(books)
        return JsonResponse(response)
  
    """Search the query directly"""
    access_start = datetime.datetime.now()
    result = crawler(query)
    access_end = datetime.datetime.now()
    print(query, 'From search', access_end-access_start) 

    doc_list, res_count = iterate_result(result)
    # for doc in doc_list:
    #     print(json.dumps(doc, sort_keys=True, indent=2, separators=(',', ':'), ensure_ascii=False))
    
    response['result'] = doc_list
    response['count'] = res_count
    return JsonResponse(response)


def crawler(query):
    # 伪造初始请求， init_hubs.php，获取随机id
    now = str(int(time.time() * 1000))
    headers = {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
        "content-type": "application/x-www-form-urlencoded",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
    }
    payload = {
        'q': query,
        'remote_ip': '',
        'time_int': now
    }
    init_r = requests.post("https://www.jiumodiary.com/init_hubs.php", data=payload, headers=headers)
    id = init_r.json()['id']
    # print(init_r.json())  # response of init_hubs.php
    # 伪造查询请求，ajax_fetch_hubs.php，获取文档信息
    headers = {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
        "content-type": "application/x-www-form-urlencoded",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
    }
    payload = {
        'id': id,
        'set': 0
    }
    hub_r = requests.post("https://www.jiumodiary.com/ajax_fetch_hubs.php", data=payload, headers=headers)
    return hub_r.json()


def identify_type(title):
    if re.match(r".*\.pdf", title):
        return "pdf"
    elif re.match(r".*\.docx", title):
        return "docx"
    elif re.match(r".*\.doc", title):
        return "doc"
    elif re.match(r".*\.txt", title):
        return "txt"
    elif re.match(r".*\.mobi", title):
        return "mobi"
    elif re.match(r".*\.zip", title):
        return "zip"
    elif re.match(r".*\.rar", title):
        return "rar"
    return "other"


# 格式化doc，保证格式符合数据库表的设计
def format_doc(doc):
    doc['type'] = identify_type(doc['title'])
    doc['size'] = ''
    doc['date'] = ''
    if re.match(r'文件大小: .*B', doc['des']):
        size = re.match('文件大小: ', doc['des']).string[6:]
        doc['size'] = size
    if doc['des'].find('分享时间: ') != -1:
        index = doc['des'].find('分享时间: ')
        date = doc['des'][(index + 6):(index + 16)]
        doc['date'] = date
    if doc['host'].find('<') != -1:
        doc['host'] = doc['host'][0:(doc['host'].find('<') - 1)]
    if len(doc['des']) > 400:
        doc['des'] = doc['des'][0:400]
    if len(doc['title']) > 200:
        doc['title'] = doc['title'][0:200]
    if len(doc['link']) >= 400:
        doc['link'] = doc['link'][0:400]
    return doc


def iterate_result(result):
    res_count = 0
    doc_list = []
    for docs in result['sources']:
        if docs['view_type'] == "view_normal":
            for doc in docs['details']['data']:
                res_count += 1
                doc = format_doc(doc)
                doc_list.append(doc)
    return doc_list, res_count
