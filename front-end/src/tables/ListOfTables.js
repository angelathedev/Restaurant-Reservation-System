import React from "react";
import TableInfo from "./TableInfo";

export default function ListOfTables({ tables }) {

    const list = tables.map(table => {
        return <TableInfo 
            key={table.table_id}
            table={table}
            table_id={table.table_id}
            table_name={table.table_name}
            capacity={table.capacity}
            status={table.status}
        />
    });

    return(
        <div>
            {list}
        </div>
    );

}