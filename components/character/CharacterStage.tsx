'use client';
/* eslint-disable next/no-img-element -- Static local character sprites are composited as layers; the rest of the client also avoids next/image. */

import { useState } from 'react';
import type { CharacterLayers } from '@/lib/game/character-art';

export function CharacterStage({
  layers,
  preview = false,
  label,
}: {
  layers: CharacterLayers | null;
  preview?: boolean;
  label: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!layers) {
    return (
      <figure className="character-stage empty">
        <figcaption>{label}</figcaption>
        <p>برای دیدن پهلوان، ابتدا جنسیت را انتخاب کن.</p>
      </figure>
    );
  }
  return (
    <figure className={'character-stage' + (preview ? ' previewing' : '')}>
      <figcaption>{label}</figcaption>
      {preview && <span className="preview-flag">پیش‌نمایش — هنوز ثبت نشده</span>}
      {failed ? (
        <p className="stage-missing">ظاهر پهلوان بارگذاری نشد. بعداً دوباره تلاش کن.</p>
      ) : (
        <>
          <img
            className="body-layer"
            src={layers.body}
            alt=""
            draggable={false}
            onError={() => setFailed(true)}
          />
          {layers.weapon && (
            <img
              className="weapon-layer"
              src={layers.weapon}
              alt=""
              draggable={false}
            />
          )}
          {layers.charm && (
            <img
              className="charm-layer"
              src={layers.charm}
              alt=""
              draggable={false}
            />
          )}
        </>
      )}
    </figure>
  );
}
