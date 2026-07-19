import { useBuilderUiStore } from '../../store/builderUiStore'
import { TEMPLATES, type TemplateId } from '../../templates'
import { SelectField } from './SelectField'

const OPTIONS = TEMPLATES.map((t) => ({ value: t.id, label: t.name }))

/**
 * Compact template picker for the preview pane header, next to
 * PaperSizeToggle. Reuses the themed SelectField so it matches every
 * other dropdown in the wizard; kept narrow so it doesn't crowd the
 * paper-size toggle. Drives templateId in builderUiStore — the same
 * store the Review step's template cards read from, so the two stay
 * in sync automatically.
 */
export function TemplateSelect() {
  const templateId = useBuilderUiStore((s) => s.templateId)
  const setTemplateId = useBuilderUiStore((s) => s.setTemplateId)

  return (
    <SelectField
      label="Template"
      hideLabel
      value={templateId}
      onChange={(v) => setTemplateId(v as TemplateId)}
      options={OPTIONS}
      wrapperClassName="w-[132px]"
    />
  )
}
