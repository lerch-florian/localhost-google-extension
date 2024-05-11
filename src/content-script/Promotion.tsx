import { useCallback } from 'react'
import { captureEvent } from '../analytics'
import type { PromotionResponse } from '../api'

interface Props {
  data: PromotionResponse
}

function Promotion({ data }: Props) {
  const capturePromotionClick = useCallback(() => {
    captureEvent('click_promotion', { link: data.url })
  }, [data.url])

  return <></>
}

export default Promotion
