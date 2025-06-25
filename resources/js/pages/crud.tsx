import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, User, Heart, FileText, Eye, Calendar, Clock, Edit, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addUserDetail, setUserDetails, updateUserDetail, deleteUserDetail } from '../store/userDetailsSlice';
import type { RootState } from '../store';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'CRUD Operations',
        href: '/crud',
    },
];

interface UserDetail {
    id: number;
    user_id: number;
    nickname: string;
    hobbies: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface PageProps extends SharedData {
    userDetails: UserDetail[];
}

export default function Crud() {
    const page = usePage<PageProps>();
    const userDetails = page.props.userDetails || [];
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<UserDetail | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingDetail, setEditingDetail] = useState<UserDetail | null>(null);
    const [deletingDetail, setDeletingDetail] = useState<UserDetail | null>(null);
    const dispatch = useDispatch();
    const reduxUserDetails = useSelector((state: RootState) => state.userDetails.userDetails);

    const { data, setData, post, processing, errors, reset } = useForm({
        nickname: '',
        hobbies: '',
        description: '',
    });

    const { 
        data: editData, 
        setData: setEditData, 
        put, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: resetEdit 
    } = useForm({
        nickname: '',
        hobbies: '',
        description: '',
    });

    const { 
        delete: deleteRecord, 
        processing: deleteProcessing 
    } = useForm();

    // On mount, initialize Redux state with userDetails from Inertia
    useEffect(() => {
        if (userDetails && userDetails.length > 0) {
            dispatch(setUserDetails(userDetails));
        }
    }, [userDetails, dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('crud.store'), {
            onSuccess: (page) => {
                // Try to get the new detail from the response if available
                if (page?.props?.userDetails && Array.isArray(page.props.userDetails)) {
                    const latest = page.props.userDetails[0];
                    if (latest) {
                        dispatch(addUserDetail(latest));
                    }
                }
                reset();
                setIsDialogOpen(false);
            },
        });
    };

    const handleViewDetail = (detail: UserDetail) => {
        setSelectedDetail(detail);
        setIsViewDialogOpen(true);
    };

    const handleEditDetail = (detail: UserDetail) => {
        setEditingDetail(detail);
        setEditData({
            nickname: detail.nickname,
            hobbies: detail.hobbies,
            description: detail.description,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDetail) {
            put(route('crud.update', editingDetail.id), {
                onSuccess: (page) => {
                    // Try to get the updated detail from the response if available
                    if (page?.props?.userDetails && Array.isArray(page.props.userDetails)) {
                        const updated = page.props.userDetails.find((d: any) => d.id === editingDetail.id);
                        if (updated) {
                            dispatch(updateUserDetail(updated));
                        }
                    }
                    resetEdit();
                    setIsEditDialogOpen(false);
                    setEditingDetail(null);
                },
            });
        }
    };

    const handleDeleteDetail = (detail: UserDetail) => {
        setDeletingDetail(detail);
    };

    const confirmDelete = () => {
        if (deletingDetail) {
            deleteRecord(route('crud.destroy', deletingDetail.id), {
                onSuccess: () => {
                    dispatch(deleteUserDetail(deletingDetail.id));
                    setDeletingDetail(null);
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="CRUD Operations" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">CRUD Operations</h1>
                        <p className="text-muted-foreground mt-1">Manage your personal details</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add New Detail
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New User Detail</DialogTitle>
                                <DialogDescription>
                                    Enter your personal information below. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nickname">Nickname</Label>
                                    <Input
                                        id="nickname"
                                        value={data.nickname}
                                        onChange={(e) => setData('nickname', e.target.value)}
                                        placeholder="Enter your nickname"
                                        className={errors.nickname ? 'border-red-500' : ''}
                                    />
                                    {errors.nickname && (
                                        <p className="text-sm text-red-500">{errors.nickname}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hobbies">Hobbies</Label>
                                    <Textarea
                                        id="hobbies"
                                        value={data.hobbies}
                                        onChange={(e) => setData('hobbies', e.target.value)}
                                        placeholder="Enter your hobbies"
                                        className={errors.hobbies ? 'border-red-500' : ''}
                                    />
                                    {errors.hobbies && (
                                        <p className="text-sm text-red-500">{errors.hobbies}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter your description"
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description}</p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4">
                    {reduxUserDetails.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <User className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No user details yet</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Click the "Add New Detail" button to add your first user detail.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {reduxUserDetails.map((detail) => (
                                <Card key={detail.id} className="hover:shadow-md transition-shadow group">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User className="h-5 w-5 text-primary" />
                                                <CardTitle className="text-lg">{detail.nickname}</CardTitle>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetail(detail)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditDetail(detail)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteDetail(detail)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="flex items-center gap-2">
                                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                                                Delete User Detail
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{detail.nickname}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={confirmDelete}
                                                                disabled={deleteProcessing}
                                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                            >
                                                                {deleteProcessing ? 'Deleting...' : 'Delete'}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                        <CardDescription>
                                            Added on {formatDate(detail.created_at)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Heart className="h-4 w-4 text-red-500" />
                                                <Label className="text-sm font-medium">Hobbies</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{detail.hobbies}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                <Label className="text-sm font-medium">Description</Label>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-3">{detail.description}</p>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleViewDetail(detail)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleEditDetail(detail)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteDetail(detail)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="flex items-center gap-2">
                                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                                            Delete User Detail
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{detail.nickname}"? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={confirmDelete}
                                                            disabled={deleteProcessing}
                                                            className="bg-red-500 hover:bg-red-600 text-white"
                                                        >
                                                            {deleteProcessing ? 'Deleting...' : 'Delete'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Read Operation - Detail View Modal */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        {selectedDetail && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl">{selectedDetail.nickname}</DialogTitle>
                                            <DialogDescription className="text-base">
                                                Personal Information Details
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                    {/* Timestamp Information */}
                                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Created: {formatDate(selectedDetail.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Time: {formatTime(selectedDetail.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Hobbies Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-5 w-5 text-red-500" />
                                            <h3 className="text-lg font-semibold">Hobbies & Interests</h3>
                                        </div>
                                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {selectedDetail.hobbies}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Description Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                            <h3 className="text-lg font-semibold">Description</h3>
                                        </div>
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {selectedDetail.description}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Additional Information */}
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold">Additional Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Record ID</p>
                                                <p className="text-sm font-medium">{selectedDetail.id}</p>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                                                <Badge variant="secondary" className="mt-1">Active</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsViewDialogOpen(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Update Operation - Edit Modal */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit User Detail</DialogTitle>
                            <DialogDescription>
                                Update your personal information below. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-nickname">Nickname</Label>
                                <Input
                                    id="edit-nickname"
                                    value={editData.nickname}
                                    onChange={(e) => setEditData('nickname', e.target.value)}
                                    placeholder="Enter your nickname"
                                    className={editErrors.nickname ? 'border-red-500' : ''}
                                />
                                {editErrors.nickname && (
                                    <p className="text-sm text-red-500">{editErrors.nickname}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-hobbies">Hobbies</Label>
                                <Textarea
                                    id="edit-hobbies"
                                    value={editData.hobbies}
                                    onChange={(e) => setEditData('hobbies', e.target.value)}
                                    placeholder="Enter your hobbies"
                                    className={editErrors.hobbies ? 'border-red-500' : ''}
                                />
                                {editErrors.hobbies && (
                                    <p className="text-sm text-red-500">{editErrors.hobbies}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editData.description}
                                    onChange={(e) => setEditData('description', e.target.value)}
                                    placeholder="Enter your description"
                                    className={editErrors.description ? 'border-red-500' : ''}
                                />
                                {editErrors.description && (
                                    <p className="text-sm text-red-500">{editErrors.description}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setEditingDetail(null);
                                        resetEdit();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editProcessing}>
                                    {editProcessing ? 'Updating...' : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Update
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
} 