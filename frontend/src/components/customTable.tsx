import { Table } from 'antd';
import { PaginationProps } from 'antd/lib/pagination';
import React, { useState } from 'react';

interface CustomTableProps {
    dataSource: any[];
    columns: any[];
}

const CustomTable: React.FC<CustomTableProps> = ({ dataSource, columns }) => {
    const [pagination, setPagination] = useState<PaginationProps>({
        current: 1,
        pageSize: 10, 
    });

    const handleTableChange = (pagination: PaginationProps) => {
        setPagination(pagination);
    };

    return (
        <Table
            dataSource={dataSource}
            columns={columns}
            pagination={pagination}
            onChange={handleTableChange}
        />
    );
};

export default CustomTable;