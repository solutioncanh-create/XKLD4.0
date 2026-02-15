/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCorners,
    rectIntersection,
    pointerWithin,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    useDroppable
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../supabaseClient';

const COLUMNS = {
    'Chờ tư vấn': { id: 'Chờ tư vấn', title: 'Chờ tư vấn', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    'Đợi đơn': { id: 'Đợi đơn', title: 'Đợi đơn', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    'Đỗ đơn': { id: 'Đỗ đơn', title: 'Đỗ đơn', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    'Rút đơn': { id: 'Rút đơn', title: 'Rút đơn', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
};

const CandidateCard = ({ id, candidate }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: id,
        data: { ...candidate }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto', // Ensure dragging item is on top
    };

    // Default Avatar
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.ho_ten)}&background=random&color=fff&size=128`;
    const avatarUrl = candidate.anh_ho_so ? candidate.anh_ho_so : defaultAvatar;

    // Get color from columns config based on status, or default
    const statusColor = COLUMNS[candidate.trang_thai] ? COLUMNS[candidate.trang_thai].text.replace('text-', 'bg-').replace('800', '500') : 'bg-gray-400';
    const borderColor = COLUMNS[candidate.trang_thai] ? COLUMNS[candidate.trang_thai].border : 'border-gray-200';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white p-3 mb-3 rounded-xl shadow-sm border ${borderColor} hover:shadow-md hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden ${isDragging ? 'shadow-2xl ring-2 ring-blue-500 ring-offset-2 rotate-2 scale-105 z-50' : 'border-opacity-60'}`}
        >
            {/* Status Indicator Stripe */}
            <div className={`absolute top-0 left-0 w-1 h-full ${statusColor} opacity-70`}></div>

            <div className="flex gap-3 items-start pl-2">
                <div className="relative shrink-0 pt-1">
                    <img
                        src={avatarUrl}
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                        alt={candidate.ho_ten}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm bg-gray-100"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate text-sm leading-tight group-hover:text-blue-600 transition-colors pt-1">
                        {candidate.ho_ten}
                        {candidate.nickname && <span className="text-xs text-gray-500 font-normal ml-1">({candidate.nickname})</span>}
                    </div>

                    <div className="flex flex-col gap-1 mt-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="material-icons text-[12px] text-gray-400">place</span>
                            <span className="truncate font-medium">{candidate.que_quan || '---'}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-50">
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <span className="material-icons text-[10px]">event</span>
                                <span>{new Date(candidate.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-300">#{candidate.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn = ({ id, items }) => {
    const { setNodeRef } = useDroppable({
        id: id
    });

    return (
        <div ref={setNodeRef} className={`flex flex-col min-w-[280px] w-[280px] rounded-xl h-full max-h-[calc(100vh-150px)] ${COLUMNS[id].bg} border ${COLUMNS[id].border}`}>
            <div className={`p-4 border-b ${COLUMNS[id].border} flex justify-between items-center bg-white bg-opacity-40 rounded-t-xl`}>
                <h2 className={`font-bold uppercase text-sm ${COLUMNS[id].text}`}>{COLUMNS[id].title}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs bg-white font-bold shadow-sm ${COLUMNS[id].text}`}>
                    {items.length}
                </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
                <SortableContext id={id} items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map((item) => (
                        <CandidateCard key={item.id} id={item.id} candidate={item} />
                    ))}
                    {items.length === 0 && (
                        <div className="h-full min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm italic bg-white bg-opacity-30 pointer-events-none">
                            Kéo thả vào đây
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export default function CandidateKanban() {
    const [candidates, setCandidates] = useState([]);
    const [items, setItems] = useState({
        'Chờ tư vấn': [],
        'Đợi đơn': [],
        'Đỗ đơn': [],
        'Rút đơn': []
    });
    const [activeId, setActiveId] = useState(null);
    const [startContainer, setStartContainer] = useState(null);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('ho_so')
                .select(`id, ho_ten, nickname, so_dien_thoai, trang_thai, created_at, anh_ho_so, que_quan`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const newItems = {
                'Chờ tư vấn': [],
                'Đợi đơn': [],
                'Đỗ đơn': [],
                'Rút đơn': []
            };

            data.forEach(c => {
                let status = c.trang_thai;
                if (!status || !COLUMNS[status]) status = 'Chờ tư vấn';
                newItems[status].push(c);
            });

            setCandidates(data);
            setItems(newItems);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            alert('Lỗi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('ho_so')
                .update({ trang_thai: newStatus })
                .eq('id', id);

            if (error) throw error;
            console.log(`Updated candidate ${id} to ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Không thể lưu trạng thái mới! Vui lòng thử lại.');
            fetchCandidates(); // Revert UI on error
        }
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        const container = findContainer(active.id);
        setStartContainer(container);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex((i) => i.id === active.id);
            const overIndex = overItems.findIndex((i) => i.id === overId);

            let newIndex;

            if (overId in prev) {
                // We're over a container
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id)
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length)
                ]
            };
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const overContainer = findContainer(over ? over.id : null);

        if (
            !startContainer ||
            !overContainer ||
            startContainer === overContainer
        ) {
            setActiveId(null);
            setStartContainer(null);
            return;
        }

        const droppedItem = candidates.find(c => c.id === active.id);
        if (droppedItem && overContainer) {
            // Optimistically update local candidate status
            const updatedCandidates = candidates.map(c =>
                c.id === active.id ? { ...c, trang_thai: overContainer } : c
            );
            setCandidates(updatedCandidates);

            updateStatus(active.id, overContainer);
        }

        setActiveId(null);
        setStartContainer(null);
    };

    const findContainer = (id) => {
        if (id in items) {
            return id;
        }
        return Object.keys(items).find((key) => items[key].find((item) => item.id === id)?.id === id);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    Quản lý Trạng thái Hồ sơ
                </h1>
                <button onClick={fetchCandidates} className="text-gray-500 hover:text-blue-600 material-icons">refresh</button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
                    {Object.keys(COLUMNS).map((colId) => (
                        <KanbanColumn key={colId} id={colId} items={items[colId]} />
                    ))}
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <CandidateCard id={activeId} candidate={candidates.find(c => c.id === activeId)} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
