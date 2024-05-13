import {makeAutoObservable} from 'mobx';


export type TItem = {
	name: string
	id: number
}

class DragService {
	targetData: TItem[] = []
	sourceData: TItem[] = [{id: 1, name: 'Капуста'}, {id: 2, name: 'Курочка'}, {id: 3, name: 'Гречка'}]

	constructor() {
		makeAutoObservable(this, {}, {autoBind: true});
	}

	setItems(items: TItem[]) {
		this.targetData = items;
	}

	addToTargetData(item: TItem) {
		this.targetData.push(item)
	}

	deleteFromTargetData(id: number) {
		this.targetData = this.targetData.filter(el => el.id !== id)
	}

}

export default new DragService()
