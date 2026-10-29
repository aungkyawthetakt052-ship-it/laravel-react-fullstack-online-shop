



import FlashMessage from "@/components/flash-message";
import { Link, router, usePage } from "@inertiajs/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import ActionMenu from "@/components/action-menu";
import { confirmDelete } from "@/lib/alert";


interface User {
    id: number,
    name: string,
    email: string,
    age: number,
    role:string,
    image: string | null,

}
interface PageProp {
    users: User[];
    search?: string;
    [key: string]: any;

}


// Delete button မှာ
const handleDelete = async (user: { id: number; name: string }) => {
    const ok = await confirmDelete({//<-- confirmDelete using sweetalert2
        title: `Delete user ${user.name}?`,
        text: "This action can't be undone.",
        confirmText: "Yes, delete",
        cancelText: "Cancel",
    });

    if (!ok) return;

    router.delete(`/user/delete/${user.id}`, {
        preserveScroll: true,
    });
};

export default function User() {
    const { users = [], search } = usePage<PageProp>().props;
    const [filter, setFilter] = useState(search ?? '');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    // function handleSubmit(e: FormEvent) {
    //     e.preventDefault();
    //     router.get('/users', {search: filter }, { preserveState: true, replace: true })
    // }

    const firstRef = useRef(true);
    useEffect(() => {
        if (firstRef.current) {
            firstRef.current = false;
            return;
        }
        const timer = setTimeout(() => {
            router.get(
                '/users', { search: filter },
                {
                    preserveState: true, replace: true,
                    only: ['users', 'search', 'flash']
                }
            )
        }, 500)

        return () => clearTimeout(timer);



    }, [filter])

    return (
        <div>
            <div className="min-w-full rounded-sm dark:bg-dark">
                <h1 className="text-xl px-4 py-6 ml-3 dark:text-white/90">Customers Managment </h1>
                <FlashMessage />
                <div className="flex mb-4">
                    <div dir="ltr" className="mr-2 ml-3">
                        <input type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}

                            className="w-90 relative py-2 px-4 
                            dark:bg-transparent
                            focus:outline-blue-500 
                            focus:outline border 
                            focus:py-1.6
                            border-gray-700  
                            rounded-s-xl  dark:text-white"
                            placeholder="Search name or email ..." />

                    </div>
                    <div dir="rtl">
                        <button className="relative right-2 bg-gray-700/60 border-s-2 border-gray-700  
                        rounded-s-lg px-3 py-[9.2px] text-white" type="submit">
                            Search
                        </button>
                    </div>
                    {filter && (
                        <button className="px-3 py-2.5 rounded-full
                             hover:bg-gray-300/50 dark:hover:bg-gray-600 absolute left-83 translate-x-auto"
                            onClick={() => setFilter("")}>
                            <X size={22} />
                        </button>
                    )}
                    <div className="ml-160">

                        <Link href={'/user/create'} >
                            <button className="bg-blue-600 rounded-md text-sky-100 hover:bg-blue-500 px-3 py-2 ">
                                + Create user
                            </button>
                        </Link>
                    </div>

                </div>
                {search && (
                    <p className="px-4 mb-4 mt-3 text-sm text-green-400">
                        {users.length} result{users.length !== 1 && "s"} for "{search}"

                    </p>
                )}




                <table className="min-w-full text-left table-auto ">

                    <thead className="dark:bg-gray-700 dark:hover:bg-gray-600 mb-3">
                        <tr>
                            <th className="px-6 py-3 m-3">#ID</th>
                            <th className="px-6 py-3 m-3">NAME</th>
                            <th className="px-6 py-3 m-3">EMAIL</th>
                            <th className="px-6 py-3 m-3">AGE</th>
                            <th className="px-6 py-3 m-3">ROLE</th>
                            <th className="px-6 py-3 m-3">IMAGE</th>
                            <th className="px-6 py-3 m-3">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                    {search ?
                                        `No user found ${search}`
                                        :
                                        `No user found`
                                    }
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr className=" bg-gray-300/20 hover:bg-gray-200/30" key={user.id}>
                                    <td className="px-6 py-3 divide-y m-3">{user.id}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
                                                {user.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <span className="font-medium dark:text-white">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 divide-y m-3">{user.email}</td>
                                    <td className="px-6 py-3 divide-y m-3">{user.age}</td>
                                    <td className="px-6 py-3 divide-y m-3">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium
                                         ${user.role === "admin" ?
                                            "bg-blue-600/80 text-white" :
                                            "bg-gray-200 text-black"

                                        }`}>
                                            {user.role}

                                        </span>
                                        
                                        </td>
                                    <td className="px-6 py-3 divide-y m-3">
                                        {user.image ? (
                                            <img src={`/storage/${user.image}`}
                                                alt={user.name}
                                                onClick={() => setPreviewImage(`/storage/${user.image}`)}
                                                className="h-12 w-20 object-cover rounded-xl cursor-pointer hover:opacity-80"
                                            />
                                        ) : (
                                            <span className="text-gray-400">No image</span>
                                        )
                                        }
                                    </td>
                                    <td className="px-6 py-3 divide-y m-3">
                                       <ActionMenu
                                       onView={()=>router.visit(`/user/${user.id}`)}
                                       onEdit={()=>router.visit(`/user/edit/${user.id}`)}
                                       onDelete={()=>{handleDelete(user)
                                       
                                       }}
                                       />

                                    </td>
                                </tr>

                            ))

                        )
                        }

                    </tbody>

                </table>


            </div>
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white hover:bg-red-500 hover:text-white font-bold text-black"
                        >
                            ✕
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                        />
                    </div>
                </div>
            )}


        </div>

    );

}