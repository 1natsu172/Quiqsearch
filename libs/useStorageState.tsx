import { logger } from "./logger"
import type { WxtStorageItemWithKey } from "./storage"

export const useStorageState = <T,>(
	storageState: WxtStorageItemWithKey<T>,
	defaultState = storageState.storage.fallback,
) => {
	const [isInitialized, setIsInitialized] = useState(false)
	const [state, setState] = useState<T>(defaultState)

	useEffect(() => {
		const init = async () => {
			const _state = await storageState.storage.getValue()
			setState(_state)
			setIsInitialized(true)
			logger.log(storageState.key, ":init:", _state)
		}
		init()

		const unwatch = storageState.storage.watch((_state) => {
			setState(_state ?? defaultState)
			logger.log(storageState.key, ":synced:", _state)
		})
		return () => unwatch()
	}, [setIsInitialized, setState])

	const onChangeState = useCallback((_state: Partial<T>) => {
		const syncSetState = async () => {
			const currentState = await storageState.storage.getValue()
			const newState = {
				...currentState,
				..._state,
			}
			storageState.storage.setValue(newState)
			logger.log(storageState.key, ":changed:", newState)
		}
		syncSetState()
	}, [])

	return {
		isInitialized,
		current: state,
		onChangeState,
	}
}
