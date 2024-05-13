import {observer} from 'mobx-react-lite';
import DragService, {TItem} from '@/service/DragService.ts';
import {DragEvent, useRef, useState} from 'react';


export const TestComponents = observer(() => {

	return <div className={'flex justify-around'}>
		<DragSource/>
		<DragTarget/>
	</div>
})


const DragTarget = observer(() => {

	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
	const targetContainerRef = useRef<HTMLDivElement>(null)
	const targetItemRef = useRef<HTMLDivElement>(null)
	const changeEnterStyle = () => {
		window.addEventListener('dragover', changeStyle)
	}

	const changeStyle = () => {
		if (targetContainerRef.current) {
			targetContainerRef.current.style.border = '1px dashed red'
		}
	}

	const changeLeaveStyle = () => {
		window.removeEventListener('dragover', changeStyle)
		if (targetContainerRef.current) {
			targetContainerRef.current.style.border = '1px solid gray'
		}
	}

	const dropInPlace = (draggingItem: TItem, type: 'newItemPaste' | 'reorder') => {
		if (DragService.targetData.length === 0 && type === 'newItemPaste') {
			DragService.addToTargetData(draggingItem)
			setDragOverIndex(null)
			return
		}
		if (dragOverIndex === null) {
			DragService.addToTargetData(draggingItem)
			return
		}

		if (type === 'reorder') {
			const listCopy = [...DragService.targetData];
			const draggingIndex = listCopy.findIndex(item => item.id === draggingItem.id);
			if (draggingIndex !== -1) {
				if (dragOverIndex !== -1 && dragOverIndex !== draggingIndex) {
					const tempItem = listCopy[draggingIndex];
					listCopy[draggingIndex] = listCopy[dragOverIndex];
					listCopy[dragOverIndex] = tempItem;
					DragService.setItems(listCopy);
				}
			}
		}
		if (type === 'newItemPaste') {
			const listCopy = [...DragService.targetData];
			if (dragOverIndex !== -1) {
				listCopy.splice(dragOverIndex, 0, draggingItem);
				DragService.setItems(listCopy);
			} else {
				DragService.addToTargetData(draggingItem);
			}
		}
		setDragOverIndex(null)

	}


	const handleDragDrop = (e: DragEvent) => {
		const targetName = 'targetdata'
		const sourceName = 'sourcedata'
		if (!e.dataTransfer.types.length) return

		const getItem = (name: 'targetdata' | 'sourcedata') => {
			return JSON.parse(e.dataTransfer.getData(name))
		}
		if (e.dataTransfer.types[0] === targetName) {
			const item = getItem(targetName)
			dropInPlace(item, 'reorder')
		}
		if (e.dataTransfer.types[0] === sourceName) {
			const item = getItem(sourceName)
			dropInPlace(item, 'newItemPaste')
		}
	}

	const handleDragInTarget = (e: DragEvent, item: TItem) => {
		e.dataTransfer.setData('targetdata', JSON.stringify(item))
	}

	return <div className={`flex h-[100vh] w-[400px] border-2 border-red-600 flex-col gap-2 border-solid`}
							ref={targetContainerRef}
							onDragEnter={changeEnterStyle}
							onDragLeave={changeLeaveStyle}
							onDrop={handleDragDrop}
							onDragOver={(e) => e.preventDefault()}
	>
		{'TARGET'} {dragOverIndex}
		{DragService.targetData.map((item, index) => {
			return <div key={item.id + Math.random()}
									className={`border-2 h-10 flex justify-center items-center cursor-grab`}
									draggable={true}
									onDragStart={(e) => handleDragInTarget(e, item)}
									style={{
										backgroundColor: dragOverIndex === index ? 'red' : 'gray'

									}}
									onDragEnter={() => setDragOverIndex(index)}
									onDragLeave={() => setDragOverIndex(null)}
									ref={targetItemRef}
			>
				{item.name}
			</div>
		})}
	</div>
})

const DragSource = observer(() => {

	const handleDragStart = (e: DragEvent, item: TItem) => {
		e.dataTransfer.setData('sourcedata', JSON.stringify(item))
	}

	return <div className={'flex h-[100vh] w-[400px] border-2 border-black flex-col gap-2'}>
		{'SOURCE'}
		{DragService.sourceData.map((item) => {
			return <div key={item.id}
									draggable={true}
									className={'border-2 h-10 flex justify-center items-center cursor-grab'}
									onDragStart={(e) => handleDragStart(e, item)}

			>
				{item.name}
			</div>
		})}
	</div>
})