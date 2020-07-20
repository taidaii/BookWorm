import React,{ Fragment } from 'react'
import { Card,Button,Modal,message } from 'antd'
import FormCollection from '../../../../common/BaseForm'
import Etable from '../../../../common/Etable'
import { updateSelectedItem, getList } from '../../../../utils'
import axios from 'axios'

export const pagination = (data,callback) =>{
    return {
        current:data.page,
        pageSize:data.pageSize,
        total:data.total,
        showQuickJumper:false,
        onChange:(current)=>{
            callback(current)
        },
        showTotal:()=>{
            return `共${data.total}条`
        }
    }
}

class FormList extends React.Component{
    
    params = {
        page:1,
        pageSize:5
    }
    data = [
        {
            type:'input',
            initialValue:'',
            label:'书名',
            placeholder:'请输入书名',
            field:'username',
            width:'120px'
        },
        {
            type:'select',
            initialValue:'',
            label:'文件类型',
            field:'siteName',
            width:'100px',
            list:[{id:0,label:'全部',value:''},{id:1,label:'pdf',value:'1'},{id:2,label:'txt',value:'2'},{id:3,label:'doc',value:'3'}]
        },
        {
            type:'chooseTime',
            label:'文件时间'
        }
    ]

    state = {
        dataSource:[],
        rowSelection:{
            selectedRowKeys:[],
            selectedRows:[]
        }
    }

    componentDidMount(){
        this.requestList()
    }
    requestList = () =>{
        const options = {
            url: '/initial/list',
            method: 'get',
            params:{
                page:this.params.page,
                pageSize:this.params.pageSize
            },
            data:{}
        }
        getList(this,options)
    }
    handleSearch = (data)=>{
        console.log(data)
        var _this = this
        var moment = require('moment')
        let API_URL = 'http://localhost:8000'
        const url = `${API_URL}/api/admin/searchbooks/`;
        let begin = moment(data.beginTime).format('YYYY-MM-DD')
        let end = moment(data.endTime).format('YYYY-MM-DD')
        let params = {
            title: data.username,
            type: data.siteName,
            begin: begin,
            end: end
        }
        console.log(params)
        axios({
            method:'post',
            url: url,
            data: params,
        })
        .then(function(response) {
            let res = response.data
            console.log(res)
            if(res.state === true){
                let sources = res.result.map((item, index) => {
                    item.key = index;
                    return item;
                });
                
                let dataSource = sources.map(function(item) {
                    return {
                        key: item.key,
                        id: item.book_id,
                        bookName: item.title,
                        siteName: item.type,
                        bookUrl: item.link
                    }
                });
                console.log(dataSource)
                _this.setState({
                    dataSource,
                    pagination: pagination(res, (current) => {
                        _this.params.page = current;
                        _this.requestList();
                    })
                })
            }
        })
    }
    handleDelete = (item,e)=>{
        e.stopPropagation()//阻止冒泡
        Modal.confirm({
            title:'确认',
            content:'您确认要删除此条数据吗？',
            onOk:()=>{
                message.success('删除成功');
                var _this = this
                let API_URL = 'http://localhost:8000'
                const url = `${API_URL}/api/admin/delete/book/`;
                axios({
                    method:'post',
                    url: url,
                    data: {id: item.id},
                })
                .then(function(response) {
                    let res = response.data
                    console.log(res)
                    if(res.state === true){
                        _this.requestList()
                    }
                })
            }
        })
    }
    render(){
        const columns = [
            {
                title:'Id',
                dataIndex:'id'
            },
            {
                title:'书名',
                dataIndex:'bookName'
            },
            {
                title:'类型',
                dataIndex:'siteName'
            },
            {
                title:'链接',
                dataIndex:'bookUrl',

            },
            {
                title:'操作',
                render:(item)=>{
                    return <Button size="small" type="primary" onClick={ (e)=>{this.handleDelete(item,e)} }>删除</Button>
                }
            }
        ];
        return (
            <Fragment>
                <Card style={{margin:'20px 0'}}>
                    <FormCollection data={this.data} handleSearch={this.handleSearch}></FormCollection>
                </Card>
                <Card>
                    <Etable
                        that={this}
                        dataSource={this.state.dataSource}
                        columns={columns}
                        pagination={this.state.pagination}
                        rowSelection={this.state.rowSelection}
                        updateSelectedItem={updateSelectedItem.bind(this)}
                    />
                </Card>
                
            </Fragment>
            

        )
    }
}

export default FormList;