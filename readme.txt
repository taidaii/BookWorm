Book Worm Search Engine - 书虫搜索引擎

前后端分离，前端文件为front-end，后端文件夹为back-end。

1. 前端启动：命令行进入front-end文件夹，npm start，查看127.0.0.1:3000即可。
2. 后端启动：mysql执行source FinalDump_book_worm.sql命令进行数据库迁移;
	    进入back-end执行pip3 install requirements.txt安装相关依赖。随后python manage.py runserver开启后端服务。