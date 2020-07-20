// import Home from './pages/Home'
// import Login from './pages/Login'
// import User from './pages/User'
    import Index from './pages/User/Home'

        import UserManage from './pages/User/Permission/UserManage'
        import OrderList from './pages/User/OrderManage/OrderList'




// import NotFound from './pages/NotFound'

// import SecondLevelComponent from './common/SecondLevelComponent'
// import ThirdLevelComponent from './common/ThirdLevelComponent'


import AsyncComponent from './utils/asyncComponent'
const Home = AsyncComponent(()=>import('./pages/homepage'));
const Login = AsyncComponent(()=>import('./pages/Login'));
const User = AsyncComponent(()=>import('./pages/User'));
const Search = AsyncComponent(()=>import('./pages/search'));

const NotFound = AsyncComponent(()=>import('./pages/NotFound'));

const SecondLevelComponent = AsyncComponent(()=>import('./common/SecondLevelComponent'));

const routes = [
    { path: '/',
        exact: true,
        component: Home,
        requiresAuth: false
    },
    {
        path: '/login',
        component: Login,
        requiresAuth: false,

    },

    {
        path: '/user',
        component: User,
        requiresAuth: true, //需要登陆后才能跳转的页面

        children:[
            {
                path: '/user/index',
                pathName:'index',
                component:Index,
                name: '首页',
                icon:'pie-chart'
            },
            {
                path: '/user/order',
                component: SecondLevelComponent,
                pathName: 'order-manage',
                name: '书籍资源管理',
                icon: 'eye',
                children: [
                    {
                        path: '/user/order/list',
                        pathName: 'order-list',
                        component: OrderList,
                        name: '电子书籍列表',
                        icon: 'table'
                    },


                ]
            },

            {
                path: '/user/permission',
                component: SecondLevelComponent,
                pathName: 'permission',
                name: '数据源管理',
                icon: 'table',
                children: [
                    {
                        path: '/user/permission/user',
                        pathName: 'user-manage',
                        component: UserManage,
                        name: '数据源列表',
                        icon: 'table'
                    },

                ]
            }
        ]

    },
    {
        path: '/search',
        component: Search,
        requiresAuth: false,
    },
    {
        path: '*',
        component: NotFound,
        requiresAuth: false,
    }
];


export default routes