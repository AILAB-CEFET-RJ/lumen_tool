import { Space, Alert } from 'antd';

const ErrorAlert = ({ message }: { message: string }) => { 
    return (
    <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
        description={message}
        type="error"
        />
    </Space>
    )
};

export default ErrorAlert;