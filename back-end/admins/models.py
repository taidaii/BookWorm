
from django.db import models

# Create your models here.

class Admin(models.Model):
    user_name = models.CharField("user_name", max_length=255)
    email = models.CharField("email", max_length=255)
    password = models.CharField("password", max_length=255)

    def __str__(self):
        return self.email


class DataSource(models.Model):
    name = models.CharField("name", max_length=255)
    url = models.CharField("url", max_length=255)

    def __str__(self):
        return self.name


class Books(models.Model):
    book_id = models.AutoField("book_id", primary_key=True)
    title = models.CharField("title", max_length=200)
    description = models.CharField("description", max_length=400)
    host = models.CharField("host", max_length=80)
    link = models.CharField("link", max_length=200)
    type = models.CharField("type", max_length=10, default="others")
    size = models.CharField("size", max_length=20, default=None)
    date = models.CharField("date", max_length=20, default=None)
    rate_summary = models.DecimalField("rate_summary", max_digits=8, decimal_places=2)

    class Meta:
        db_table = "books" 

    def __str__(self):
        return str(self.book_id) + '-' + self.title
