import { ReactNode, useState } from 'react';
import { Layout, Menu, Dropdown, Space, Tooltip } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '../context';

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const { isLoggedIn, tipoUsuario, nomeUsuario } = useAuth(); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const items = [
        {
            key: '1',
            label: isLoggedIn ? <span>Seja bem-vindo, {nomeUsuario}</span> : <Link href="/textgrader/login">Entrar</Link>
        },
    ];

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%' }}>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                >
                    <Menu.Item>
                        <Link href="/textgrader">
                            TextGrader
                        </Link>
                    </Menu.Item>
                    {isLoggedIn === false ? (
                        <Tooltip title="Você precisa fazer login para acessar essa página">
                            <div onClick={(e) => e.preventDefault()}>
                                <Menu.Item disabled>
                                    Home
                                </Menu.Item>
                            </div>
                        </Tooltip>
                    ) : (
                        <Menu.Item>
                            <Link href="/textgrader/home">
                                Home
                            </Link>
                        </Menu.Item>
                    )}
                    <Menu.Item>
                        <Link href="/textgrader/competencias">
                            Competências
                        </Link>
                    </Menu.Item>
                    <Menu.Item>
                        <Link href="/textgrader/sobre">
                            Sobre
                        </Link>
                    </Menu.Item>
                    <Menu.Item style={{ marginLeft: isLoggedIn ? '720px' : '830px' }}>
                        <Dropdown
                            menu={{ items }}
                            onOpenChange={handleMenuClick}
                            overlayStyle={{ marginTop: '8px' }}
                        >
                            <Space onClick={handleMenuClick}>
                                {isLoggedIn === true ? `${nomeUsuario}` : 'Login'}
                                {isMenuOpen ? <CaretDownOutlined /> : <CaretUpOutlined />}
                            </Space>
                        </Dropdown>
                    </Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '20px 0' }}>{children}</Content>
        </Layout>
    );
};

export default MainLayout;