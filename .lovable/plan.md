

# Limpeza de Código — Arquivos e Hooks Não Utilizados

## Situação Atual
O projeto acumulou componentes, hooks e utilitários que não são importados em lugar nenhum. Isso aumenta o bundle, confunde a manutenção e polui o codebase.

## Arquivos a Remover

### Componentes sem uso (nunca importados)
| Arquivo | Motivo |
|---|---|
| `src/components/CompanyPagePreview.tsx` | Não importado |
| `src/components/IntelligentScheduling.tsx` | Não importado |
| `src/components/booking/DynamicPriceDisplay.tsx` | Não importado |
| `src/components/booking/ServiceFilters.tsx` | Não importado |
| `src/components/client/StoriesCarousel.tsx` | Não importado |
| `src/components/ui/use-toast.tsx` | Duplicata — todo mundo usa `@/hooks/use-toast` |
| `src/components/ui/use-mobile.tsx` | Duplicata — todo mundo usa `@/hooks/use-mobile` |

### Hooks sem uso (nunca importados)
| Arquivo | Motivo |
|---|---|
| `src/hooks/useEmailCampaigns.ts` | Não importado em nenhum arquivo |
| `src/hooks/usePushNotifications.ts` | Não importado em nenhum arquivo |

### Utilitários sem uso
| Arquivo | Motivo |
|---|---|
| `src/lib/appointmentUtils.ts` | Não importado em nenhum arquivo |

### Outros
| Arquivo | Motivo |
|---|---|
| `vite.config.ts.timestamp-1760494324946-073a4f0ac3db7.mjs` | Arquivo temporário gerado pelo Vite |

## Total: 11 arquivos para remover

Nenhuma alteração funcional — apenas exclusão de dead code.

