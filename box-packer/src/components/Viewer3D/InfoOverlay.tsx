import type { PlacedItem } from '../../types'

interface Props {
  item: PlacedItem
  onClose: () => void
}

export function InfoOverlay({ item, onClose }: Props) {
  const { product, position, dims } = item
  return (
    <div className="absolute bottom-4 left-4 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-white shadow-lg min-w-48 z-10">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-sm">{product.name}</p>
        <button onClick={onClose} className="text-gray-500 hover:text-white ml-3">✕</button>
      </div>
      <div className="flex flex-col gap-1 text-gray-400">
        <p>크기: {dims.w} × {dims.d} × {dims.h} cm</p>
        <p>무게: {product.weight} kg</p>
        <p>위치: x={position.x.toFixed(1)}, y={position.y.toFixed(1)}, z={position.z.toFixed(1)}</p>
      </div>
    </div>
  )
}
