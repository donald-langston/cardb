import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCars, deleteCar } from "../api/carapi";
import { DataGrid, GridCellParams, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Snackbar, Tooltip, Stack, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCar from "./AddCar";
import EditCar from "./EditCar";

type CarlistProps = {
    logOut?: () => void;
}

function Carlist({ logOut }: CarlistProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, error, isSuccess } = useQuery({
        queryKey: ["cars"],
        queryFn: getCars
    });

    const { mutate } = useMutation(deleteCar, {
        onSuccess: () => {
            setOpen(true);
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
        onError: (err) => {
            console.error(err);
        },
    })

    const columns: GridColDef[] = [
        {field: 'brand', headerName: 'Brand', width: 200},
        {field: 'model', headerName: 'Model', width: 200},
        {field: 'color', headerName: 'Color', width: 200},
        {field: 'registrationNumber', headerName: 'Reg.nr.', width: 150},
        {field: 'modelYear', headerName: 'Model Year', width: 150},
        {field: 'price', headerName: 'Price', width: 150},
        {
            field: 'edit',
            headerName: '',
            width: 90,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridCellParams) => <EditCar carData={params.row}/>
        },
        {
            field: 'delete',
            headerName: '',
            width: 90,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params: GridCellParams) => (
                <Tooltip title="Delete car">
                    <IconButton aria-label="delete" size="small" onClick={() => {
                        if(window.confirm(`Are you sure you want to delete ${params.row.brand} ${params.row.model}?`)) {
                            mutate(params.row._links.car.href);
                        }
                    }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                
            )
        },
    ];
    
    if(!isSuccess) {
        return <span>Loading...</span>
    } else if(error) {
        return <span>Error when fetching cars...</span>
    } else {
        return (
            <>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <AddCar />
                    <Button onClick={logOut}>Log out</Button>
                </Stack>
                <DataGrid
                    rows={data}
                    columns={columns}
                    disableRowSelectionOnClick={true}
                    getRowId={row => row._links.self.href}
                    slots={{ toolbar: GridToolbar }} 
                />
                <Snackbar 
                    open={open} 
                    autoHideDuration={2000} 
                    onClose={() => setOpen(false)} 
                    message="Car Deleted" />
            </>
            
        )
    }
}

export default Carlist;