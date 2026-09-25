'use client';
/* eslint-disable next/no-img-element -- Static local character portraits are local PNGs; the rest of the client also avoids next/image. */

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CharacterStage } from '@/components/character/CharacterStage';
import {
  GENDER_NAMES,
  GENDERS,
  type Gender,
  type Slot,
} from '@/lib/game/content';
import type { ItemInstance } from '@/lib/game/engine';
import { characterLayers } from '@/lib/game/character-art';

export function CharacterCreation({
  defaultName,
  returning,
  busy,
  equipment,
  onSubmit,
}: {
  defaultName: string;
  returning: boolean;
  busy: boolean;
  equipment: Record<Slot, ItemInstance | null>;
  onSubmit: (gender: Gender, name: string) => void;
}) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [name, setName] = useState(defaultName);
  const preview = useMemo(
    () => (gender ? characterLayers(gender, equipment, null) : null),
    [gender, equipment],
  );
  const validName = name.trim().length >= 2 && name.trim().length <= 24;
  return (
    <section className="character-setup" aria-label="ساخت پهلوان">
      <p className="eyebrow">آغاز داستان</p>
      <p className="setup-lead">
        {returning
          ? 'پیشرفتت محفوظ است؛ ظاهر پهلوانت را انتخاب کن.'
          : 'این انتخاب فقط ظاهر پهلوان را تغییر می‌دهد؛ توانایی‌ها یکسان‌اند.'}
      </p>
      <fieldset className="gender-fieldset">
        <legend>جنسیت پهلوان</legend>
        <div className="gender-cards">
          {GENDERS.map((id) => {
            const selected = gender === id;
            return (
              <label
                key={id}
                className={'gender-card' + (selected ? ' selected' : '')}
              >
                <input
                  type="radio"
                  name="hero-gender"
                  value={id}
                  checked={selected}
                  onChange={() => setGender(id)}
                />
                <img src={`/art/character/${id}-portrait.png`} alt="" />
                <span>{GENDER_NAMES[id]}</span>
                {selected && <b>انتخاب‌شده</b>}
              </label>
            );
          })}
        </div>
      </fieldset>
      {!gender && (
        <p className="setup-hint">برای ادامه، جنسیت پهلوانت را انتخاب کن.</p>
      )}
      {preview && (
        <CharacterStage
          layers={preview}
          label={`پیش‌نمایش پهلوان ${GENDER_NAMES[gender!]} با تجهیزات فعلی`}
        />
      )}
      <form
        className="setup-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!gender || !validName || busy) return;
          onSubmit(gender, name.trim());
        }}
      >
        <label htmlFor="setup-name">نام پهلوان</label>
        <Input
          id="setup-name"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={24}
          required
          disabled={busy}
        />
        <Button type="submit" disabled={!gender || !validName || busy}>
          {busy
            ? 'در حال ساخت پهلوان…'
            : returning
              ? 'ثبت ظاهر و ادامه'
              : 'آغاز ماجراجویی'}
        </Button>
      </form>
    </section>
  );
}
