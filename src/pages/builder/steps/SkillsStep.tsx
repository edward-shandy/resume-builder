import { useEffect } from 'react'
import { useResumeStore } from '../../../store/resumeStore'
import { useBuilderUiStore } from '../../../store/builderUiStore'
import { Button } from '../../../components/ui/Button'
import { SkillChipInput } from '../../../components/builder/SkillChipInput'
import { getSkillSuggestions } from '../../../components/builder/skillSuggestions'
import { useReorderFlash } from '../../../components/builder/useReorderFlash'

/**
 * Step 5 — Skills. Groups of chips (default "Technical Skills", plus
 * any custom groups). Each group's label is an inline-editable text
 * field; chips are added/removed via SkillChipInput. The printable
 * preview flattens each group to a single plain-text line — chips are
 * an editing affordance only, never rendered on the paper itself.
 */
export function SkillsStep() {
  const skills = useResumeStore((s) => s.data.skills)
  const addSkillGroup = useResumeStore((s) => s.addSkillGroup)
  const updateSkillGroup = useResumeStore((s) => s.updateSkillGroup)
  const removeSkillGroup = useResumeStore((s) => s.removeSkillGroup)
  const nextStep = useBuilderUiStore((s) => s.nextStep)
  const prevStep = useBuilderUiStore((s) => s.prevStep)

  const flashedIds = useReorderFlash(skills.map((g) => g.id))

  // Ensure a default "Technical Skills" group exists so the step never
  // opens completely empty — created lazily on first visit, not in the
  // store's initial state, so old drafts aren't retroactively mutated.
  useEffect(() => {
    if (skills.length === 0) {
      addSkillGroup()
      const list = useResumeStore.getState().data.skills
      const created = list[list.length - 1]
      if (created) updateSkillGroup(created.id, { label: 'Technical Skills' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills.length])

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-4">
      <div className="-mx-4 flex min-h-0 flex-col gap-4 overflow-y-auto px-4">
      <div>
        <h3 className="font-display text-xl font-medium text-white">Skills</h3>
        <p className="mt-1 font-body text-sm text-slate">
          Group related skills together. Type a skill and press Enter or comma to turn it into a chip.
        </p>
      </div>

      <div className="flex max-h-[min(50vh,460px)] flex-col gap-3 overflow-y-auto pb-2 pr-1">
        {skills.map((group) => (
          <div
            key={group.id}
            className={[
              'shrink-0 flex flex-col gap-2.5 rounded-xl border border-white/10 bg-navy-deep/40 p-4 transition-shadow duration-300',
              flashedIds.has(group.id) ? 'ring-2 ring-gold/70' : '',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <input
                value={group.label}
                onChange={(e) => updateSkillGroup(group.id, { label: e.target.value })}
                placeholder="e.g. Technical Skills, Soft Skills, Tools & Platforms"
                className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-1 font-body text-sm font-semibold text-white placeholder:text-white/30 outline-none transition-all duration-200 hover:border-white/10 focus:border-gold/60 focus:bg-navy-deep/60 focus:px-3 focus:py-1.5"
              />
              {skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSkillGroup(group.id)}
                  aria-label="Remove group"
                  className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/40 transition-all duration-150 hover:scale-110 hover:bg-red-500/15 hover:text-red-300"
                >
                  ×
                </button>
              )}
            </div>

            <SkillChipInput
              items={group.items}
              onChange={(items) => updateSkillGroup(group.id, { items })}
              suggestions={getSkillSuggestions(group.label)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => addSkillGroup()}
          className="label-readout flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-white/50 transition-all duration-200 hover:border-gold/50 hover:text-gold"
        >
          + Add group
        </button>
      </div>
      </div>

      <div className="mt-2 flex shrink-0 items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => prevStep()}>
          Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => nextStep()}>
          Next: Extras
        </Button>
      </div>
    </div>
  )
}
