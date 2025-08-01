import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
    Alert,
    Chip,
    Link,
    Tooltip,
    TablePagination,
} from '@mui/material';
import {
    Search,
    OpenInNew,
    Phone,
    Email,
    Badge,
    Clear,
} from '@mui/icons-material';
import { fetchEmployeeSummary, searchEmployees, clearSearchResults } from '../store/hrSlice';

const EmployeeList = () => {
    const dispatch = useDispatch();
    const { employees, searchResults, loading } = useSelector((state) => state.hr);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        dispatch(fetchEmployeeSummary());
    }, [dispatch]);

    const handleSearch = (value) => {
        setSearchQuery(value);
        if (value.length >= 2) {
            dispatch(searchEmployees(value));
        } else {
            dispatch(clearSearchResults());
        }
        setPage(0); // Reset to first page on search
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        dispatch(clearSearchResults());
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewProfile = (profileId) => {
        window.open(`/hr/review/${profileId}`, '_blank');
    };

    const displayedEmployees = searchQuery.length >= 2 ? searchResults : employees;
    const paginatedEmployees = displayedEmployees.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const getWorkAuthDisplay = (type) => {
        if (!type || type === 'N/A') return 'Not Specified';

        const visaTypes = ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4'];
        if (visaTypes.includes(type)) {
            return <Chip label={type} size="small" color="primary" variant="outlined" />;
        } else if (type === 'Green Card' || type === 'Citizen') {
            return <Chip label={type} size="small" color="success" variant="outlined" />;
        }
        return type;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Employee Profiles
            </Typography>

            <Paper sx={{ p: 3 }}>
                {/* Search Bar */}
                <Box mb={3}>
                    <TextField
                        fullWidth
                        placeholder="Search by first name, last name, or preferred name..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClearSearch} size="small">
                                            <Clear />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />

                    {/* Search Results Info */}
                    {searchQuery.length >= 2 && (
                        <Box mt={2}>
                            {searchResults.length === 0 ? (
                                <Alert severity="info">
                                    No employees found matching "{searchQuery}"
                                </Alert>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Found {searchResults.length} employee{searchResults.length !== 1 ? 's' : ''} matching "{searchQuery}"
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Employee Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>SSN</TableCell>
                                <TableCell>Work Authorization</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map((employee) => (
                                    <TableRow key={employee._id} hover>
                                        <TableCell>
                                            <Link
                                                component="button"
                                                variant="body2"
                                                onClick={() => handleViewProfile(employee._id)}
                                                sx={{
                                                    textDecoration: 'none',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                {employee.fullName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <Badge fontSize="small" color="action" />
                                                <Typography variant="body2">{employee.ssn}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{getWorkAuthDisplay(employee.workAuthorizationType)}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <Phone fontSize="small" color="action" />
                                                <Typography variant="body2">{employee.phone}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <Email fontSize="small" color="action" />
                                                <Typography variant="body2">{employee.email}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Full Profile">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewProfile(employee._id)}
                                                >
                                                    <OpenInNew />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            {searchQuery ? 'No employees found' : 'No employees registered yet'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={displayedEmployees.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                {/* Summary */}
                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Total Employees: {employees.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Showing {paginatedEmployees.length} of {displayedEmployees.length} employees
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default EmployeeList;