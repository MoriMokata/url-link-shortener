import { useMutation, useQueryClient } from '@tanstack/react-query'
import { linksApi } from '../api/links'

/** Disable/enable/delete mutations shared by the dashboard and the link detail page. */
export function useLinkMutations() {
  const queryClient = useQueryClient()

  function invalidate(code: string) {
    queryClient.invalidateQueries({ queryKey: ['links'] })
    queryClient.invalidateQueries({ queryKey: ['link', code] })
  }

  const disable = useMutation({
    mutationFn: linksApi.disable,
    onSuccess: (_data, code) => invalidate(code),
  })

  const enable = useMutation({
    mutationFn: linksApi.enable,
    onSuccess: (_data, code) => invalidate(code),
  })

  const remove = useMutation({
    mutationFn: linksApi.delete,
    onSuccess: (_data, code) => invalidate(code),
  })

  return { disable, enable, remove }
}
