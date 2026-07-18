import { useState } from 'react'
import { useResumeStore, type WorkExperienceEntry } from '../../../store/resumeStore'
import { useBuilderUiStore } from '../../../store/builderUiStore'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/builder/FormField'
import { DateSelect } from '../../../components/builder/DateSelect'
import { EntryCard } from '../../../components/builder/EntryCard'
import { BulletListEditor } from '../../../components/builder/BulletListEditor'

function entryTitle(entry: WorkExperienceEntry) {
  if (entry.jobTitle && entry.company) return `${entry.jobTitle} @ ${entry.company}`
  return entry.jobTitle || entry.company || 'New position'
}

function entrySubtitle(entry: WorkExperienceEntry) {
  const end = entry.isCurrent ? 'Present' : entry.endDate
  if (!entry.startDate && !end) return undefined
  return `${entry.startDate || '—'} – ${end || '—'}`
}

/**
 * Step 3 — Experience. The most complex step: repeatable, single-open
 * accordion of entries so the form never sprawls, reorder via ↑/↓,
 * two-click confirm delete. Next is never gated (repeatable steps stay
 * optional — Review will be the place that nudges completeness).
 */
export function ExperienceStep() {
  const experience = useResumeStore((s) => s.data.experience)
  const addExperience = useResumeStore((s) => s.addExperience)
  const updateExperience = useResumeStore((s) => s.updateExperience)
  const removeExperience = useResumeStore((s) => s.removeExperience)
  const reorderExperience = useResumeStore((s) => s.reorderExperience)
  const nextStep = useBuilderUiStore((s) => s.nextStep)
  const prevStep = useBuilderUiStore((s) => s.prevStep)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newId, setNewId] = useState<string | null>(null)

  const handleAdd = () => {
    addExperience()
    // The store appends, so the new entry is always last after the add.
    setTimeout(() => {
      const list = useResumeStore.getState().data.experience
      const last = list[list.length - 1]
      if (last) {
        setExpandedId(last.id)
        setNewId(last.id)
      }
    }, 0)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl font-medium text-white">Experience</h3>
        <p className="mt-1 font-body text-sm text-slate">
          Reverse-chronological works best. Add roles one at a time — each card stays tidy until you open it.
        </p>
      </div>

      <div className="flex max-h-[min(46vh,420px)] flex-col gap-2.5 overflow-y-auto pr-1">
        {experience.map((entry, index) => (
          <EntryCard
            key={entry.id}
            title={entryTitle(entry)}
            subtitle={entrySubtitle(entry)}
            isExpanded={expandedId === entry.id}
            onToggleExpand={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            onDelete={() => removeExperience(entry.id)}
            onMoveUp={() => reorderExperience(index, index - 1)}
            onMoveDown={() => reorderExperience(index, index + 1)}
            canMoveUp={index > 0}
            canMoveDown={index < experience.length - 1}
            isNew={entry.id === newId}
          >
            <div className="flex flex-col gap-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <FormField
                  label="Job title"
                  required
                  value={entry.jobTitle}
                  onChange={(e) => updateExperience(entry.id, { jobTitle: e.target.value })}
                  placeholder="QA Automation Engineer"
                />
                <FormField
                  label="Company"
                  required
                  value={entry.company}
                  onChange={(e) => updateExperience(entry.id, { company: e.target.value })}
                  placeholder="Northstar Labs"
                />
                <FormField
                  label="Location"
                  value={entry.location}
                  onChange={(e) => updateExperience(entry.id, { location: e.target.value })}
                  placeholder="Remote"
                  wrapperClassName="sm:col-span-2"
                />
                <DateSelect
                  label="Start date"
                  required
                  value={entry.startDate}
                  onChange={(v) => updateExperience(entry.id, { startDate: v })}
                />
                <div className="flex flex-col gap-1.5">
                  <DateSelect
                    label="End date"
                    value={entry.endDate}
                    onChange={(v) => updateExperience(entry.id, { endDate: v })}
                    disabled={entry.isCurrent}
                  />
                  <label className="flex items-center gap-2 pt-0.5 font-body text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={entry.isCurrent}
                      onChange={(e) => updateExperience(entry.id, { isCurrent: e.target.checked })}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-navy-deep/50 accent-gold"
                    />
                    I currently work here
                  </label>
                </div>
              </div>

              <BulletListEditor
                bullets={entry.bullets}
                onChange={(bullets) => updateExperience(entry.id, { bullets })}
              />
            </div>
          </EntryCard>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="label-readout flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-white/50 transition-all duration-200 hover:border-gold/50 hover:text-gold"
        >
          + Add Experience
        </button>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <Button variant="secondary" size="sm" onClick={() => prevStep()}>
          Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => nextStep()}>
          Next: Education
        </Button>
      </div>
    </div>
  )
}
