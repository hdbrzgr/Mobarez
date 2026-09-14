'use client';
/* eslint-disable next/no-img-element -- Static local character sprites are composited as layers; the rest of the client also avoids next/image. */

import { useMemo, useState } from 'react';
import {
  Backpack,
  Check,
  Coins,
  Heart,
  Pencil,
  Shield,
  Sparkles,
  Swords,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CharacterStage } from '@/components/character/CharacterStage';
import {
  COSTUMES,
  GENDER_NAMES,
  GENDERS,
  INVENTORY_CAP,
  ITEMS,
  SLOT_NAMES,
  fa,
  type Gender,
  type Item,
  type Slot,
} from '@/lib/game/content';
import {
  characterLayers,
  itemIconSrc,
  layersFromState,
} from '@/lib/game/character-art';
import {
  derived,
  previewCostume as withCostume,
  previewEquipment,
  type Action,
  type GameState,
} from '@/lib/game/engine';

const rarityNames = { common: 'معمولی', rare: 'کمیاب', epic: 'حماسی' };

function ItemIcon({ item }: { item: Item }) {
  const src = itemIconSrc(item.id);
  if (src)
    return (
      <span className="item-symbol art">
        <img src={src} alt="" />
      </span>
    );
  return (
    <span className="item-symbol">
      {item.slot === 'weapon' ? (
        <Swords />
      ) : item.slot === 'armor' ? (
        <Shield />
      ) : (
        <Sparkles />
      )}
    </span>
  );
}

function ItemStats({ item }: { item: Item }) {
  return (
    <div className="item-stats">
      {item.attack > 0 && (
        <span>
          <Swords /> حمله +{fa(item.attack)}
        </span>
      )}
      {item.armor > 0 && (
        <span>
          <Shield /> زره +{fa(item.armor)}
        </span>
      )}
      {item.vitality > 0 && (
        <span>
          <Heart /> سلامتی +{fa(item.vitality)}
        </span>
      )}
    </div>
  );
}

function Delta({
  label,
  before,
  after,
}: {
  label: string;
  before: number;
  after: number;
}) {
  const diff = after - before;
  const tone = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
  const text =
    diff > 0 ? `+${fa(diff)}` : diff < 0 ? fa(diff) : 'بدون تغییر';
  return (
    <span className={'stat-delta ' + tone}>
      {label}: {fa(before)} ← {fa(after)} ({text})
    </span>
  );
}

export function HeroScreen({
  game,
  ready,
  justCreated,
  onAct,
  onExpedition,
  onMarket,
  onRename,
}: {
  game: GameState;
  ready: boolean;
  justCreated: boolean;
  onAct: (action: Action) => void;
  onExpedition: () => void;
  onMarket: () => void;
  onRename: () => void;
}) {
  const [tab, setTab] = useState<'gear' | 'wardrobe'>('gear');
  const [filter, setFilter] = useState<'all' | Slot>('all');
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [previewCostume, setPreviewCostume] = useState<
    string | null | undefined
  >(undefined);
  const [revealGear, setRevealGear] = useState(false);
  const [sellId, setSellId] = useState<string | null>(null);
  const [editAppearance, setEditAppearance] = useState(false);
  const [draftGender, setDraftGender] = useState<Gender | null>(
    game.appearance.gender,
  );
  const committedKey = `${game.equipment.weapon}|${game.equipment.armor}|${game.equipment.charm}|${game.appearance.activeCostumeId}|${game.appearance.gender}`;
  const [seenKey, setSeenKey] = useState(committedKey);
  if (seenKey !== committedKey) {
    setSeenKey(committedKey);
    setPreviewItemId(null);
    setPreviewCostume(undefined);
    setRevealGear(false);
    setDraftGender(game.appearance.gender);
  }
  const previewItem = ITEMS.find((i) => i.id === previewItemId) ?? null;
  const display = useMemo(() => {
    let next = game;
    if (previewItem)
      next = previewEquipment(next, previewItem.slot, previewItem.id);
    if (previewCostume !== undefined) next = withCostume(next, previewCostume);
    return next;
  }, [game, previewItem, previewCostume]);
  const current = derived(game);
  const previewed = derived(display);
  const unsaved = previewItemId !== null || previewCostume !== undefined;
  const gender = display.appearance.gender;
  const layers = gender
    ? characterLayers(
        gender,
        display.equipment,
        display.appearance.activeCostumeId,
        revealGear,
      )
    : layersFromState(display, revealGear);
  const costumeActive = display.appearance.activeCostumeId;
  const sellItem = ITEMS.find((i) => i.id === sellId);
  return (
    <>
      {justCreated && (
        <div className="panel setup-success">
          <p>پهلوانت آماده است. تجهیزات پوشیده‌شده را ببین، سپس نخستین لشکرکشی را آغاز کن.</p>
          <Button onClick={onExpedition}>نخستین لشکرکشی</Button>
        </div>
      )}
      <div className="panel hero-summary">
        <div className="hero-identity">
          {game.appearance.gender && (
            <img
              className="hero-portrait"
              src={`/art/character/${game.appearance.gender}-portrait.png`}
              alt=""
            />
          )}
          <div>
            <span className="eyebrow">شناسنامهٔ پهلوان</span>
            <h2>{game.name}</h2>
            <p>
              سطح {fa(game.level)} · {fa(game.wins)} پیروزی ·{' '}
              {fa(game.dungeonClears)} دژ پاک‌سازی‌شده
            </p>
          </div>
        </div>
        <div className="hero-summary-actions">
          <Button
            variant="outline"
            disabled={!ready}
            onClick={() => setEditAppearance(true)}
          >
            ویرایش ظاهر
          </Button>
          <Button variant="outline" disabled={!ready} onClick={onRename}>
            <Pencil /> تغییر نام
          </Button>
        </div>
      </div>
      <div className="hero-dress">
        <div className="hero-stage-column">
          <CharacterStage
            layers={layers}
            preview={unsaved}
            label={`پهلوان ${game.name}`}
          />
          {layers?.concealsArmor && (
            <p className="costume-note">
              زره فعال است؛ پوشاک ظاهر آن را پوشانده.
            </p>
          )}
          {costumeActive && (
            <label className="reveal-gear">
              <input
                type="checkbox"
                checked={revealGear}
                onChange={(e) => setRevealGear(e.target.checked)}
              />
              نمایش تجهیزات زیر پوشاک
            </label>
          )}
          <div className="equipment-grid on-stage">
            {(Object.keys(SLOT_NAMES) as Slot[]).map((slot) => {
              const item = ITEMS.find((i) => i.id === game.equipment[slot]);
              return (
                <button
                  type="button"
                  className={
                    'equipment-slot ' +
                    (item?.rarity ?? '') +
                    (filter === slot ? ' selected-slot' : '')
                  }
                  key={slot}
                  onClick={() => setFilter(filter === slot ? 'all' : slot)}
                >
                  {item ? (
                    <ItemIcon item={item} />
                  ) : (
                    <span className="item-symbol">
                      {slot === 'weapon' ? (
                        <Swords />
                      ) : slot === 'armor' ? (
                        <Shield />
                      ) : (
                        <Sparkles />
                      )}
                    </span>
                  )}
                  <small>{SLOT_NAMES[slot]}</small>
                  <h3>{item?.name ?? 'جایگاه خالی'}</h3>
                  {item ? (
                    <ItemStats item={item} />
                  ) : (
                    <p>
                      {slot === 'charm'
                        ? 'از کوله‌پشتی یک نشان بپوش.'
                        : 'از کوله‌پشتی این جایگاه را پر کن.'}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="hero-kit-column">
          <div className="hero-tabs" role="tablist" aria-label="تجهیزات و پوشاک">
            <Button
              role="tab"
              aria-selected={tab === 'gear'}
              variant={tab === 'gear' ? 'secondary' : 'ghost'}
              onClick={() => {
                setTab('gear');
                setPreviewCostume(undefined);
              }}
            >
              تجهیزات
            </Button>
            <Button
              role="tab"
              aria-selected={tab === 'wardrobe'}
              variant={tab === 'wardrobe' ? 'secondary' : 'ghost'}
              onClick={() => {
                setTab('wardrobe');
                setPreviewItemId(null);
              }}
            >
              پوشاک
            </Button>
          </div>
          {tab === 'gear' && (
            <>
              {previewItem && (
                <div className="panel item-compare">
                  <h3>{previewItem.name}</h3>
                  <p>
                    {rarityNames[previewItem.rarity]} · {SLOT_NAMES[previewItem.slot]}
                    {game.equipment[previewItem.slot] === previewItem.id
                      ? ' · پوشیده‌شده'
                      : ''}
                  </p>
                  <ItemStats item={previewItem} />
                  <div className="compare-lines">
                    <Delta
                      label="حمله"
                      before={current.attack}
                      after={previewed.attack}
                    />
                    <Delta
                      label="زره"
                      before={current.armor}
                      after={previewed.armor}
                    />
                    <Delta
                      label="سلامتی بیشینه"
                      before={current.maxHp}
                      after={previewed.maxHp}
                    />
                  </div>
                  {previewed.maxHp > current.maxHp && (
                    <p className="info-note">
                      افزایش سلامتی بیشینه ظرفیت است؛ سلامتی فعلی کامل پر نمی‌شود.
                    </p>
                  )}
                  <div className="item-actions">
                    {game.equipment[previewItem.slot] === previewItem.id ? (
                      <Button
                        variant="outline"
                        disabled={!ready}
                        onClick={() =>
                          onAct({
                            type: 'unequip',
                            slot: previewItem.slot,
                          })
                        }
                      >
                        از تن خارج کن
                      </Button>
                    ) : (
                      <Button
                        disabled={!ready}
                        onClick={() =>
                          onAct({
                            type: 'equip',
                            itemId: previewItem.id,
                          })
                        }
                      >
                        پوشیدن
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => setPreviewItemId(null)}
                    >
                      انصراف
                    </Button>
                  </div>
                </div>
              )}
              <div className="section-heading">
                <h2>
                  <Backpack /> کوله‌پشتی
                </h2>
                <span>
                  {fa(game.inventory.length)} / {fa(INVENTORY_CAP)} وسیله
                </span>
              </div>
              <div className="filter-bar">
                {(['all', 'weapon', 'armor', 'charm'] as const).map((f) => (
                  <Button
                    variant={filter === f ? 'secondary' : 'ghost'}
                    key={f}
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'همه' : SLOT_NAMES[f]}
                  </Button>
                ))}
              </div>
              <div className="item-grid">
                {ITEMS.filter(
                  (item) =>
                    game.inventory.includes(item.id) &&
                    (filter === 'all' || item.slot === filter),
                ).map((item) => {
                  const equipped = game.equipment[item.slot] === item.id,
                    count = game.inventory.filter((id) => id === item.id)
                      .length,
                    previewing = previewItemId === item.id;
                  return (
                    <article
                      className={
                        'item-card ' +
                        item.rarity +
                        (previewing ? ' previewing-card' : '')
                      }
                      key={item.id}
                    >
                      <button
                        type="button"
                        className="item-select"
                        onClick={() => setPreviewItemId(item.id)}
                      >
                        <div className="item-card-top">
                          <ItemIcon item={item} />
                          <span className="rarity">
                            {rarityNames[item.rarity]}
                            {count > 1 && ` · ${fa(count)} عدد`}
                          </span>
                        </div>
                        <h3>{item.name}</h3>
                        <ItemStats item={item} />
                      </button>
                      <div className="item-actions">
                        <Button
                          variant={equipped ? 'secondary' : 'outline'}
                          disabled={!ready || equipped}
                          onClick={() => {
                            setPreviewItemId(item.id);
                            onAct({ type: 'equip', itemId: item.id });
                          }}
                        >
                          {equipped ? (
                            <>
                              <Check /> پوشیده‌شده
                            </>
                          ) : (
                            'پوشیدن'
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={!ready || (equipped && count === 1)}
                          onClick={() => setSellId(item.id)}
                        >
                          فروش · {fa(Math.floor(item.price * 0.4))}
                          <Coins />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
              {!ITEMS.some(
                (i) =>
                  game.inventory.includes(i.id) &&
                  (filter === 'all' || i.slot === filter),
              ) && (
                <div className="empty-state">
                  <Backpack />
                  <h3>هنوز وسیله‌ای در این بخش نداری</h3>
                  <p>در نبردها غنیمت جمع کن یا از بازار خرید کن.</p>
                  <Button variant="outline" onClick={onMarket}>
                    رفتن به بازار
                  </Button>
                </div>
              )}
            </>
          )}
          {tab === 'wardrobe' && (
            <div className="wardrobe">
              <p className="info-note">فقط ظاهر را تغییر می‌دهد</p>
              <div className="wardrobe-grid">
                <button
                  type="button"
                  className={
                    'wardrobe-card' +
                    (costumeActive === null && previewCostume === undefined
                      ? ' worn'
                      : '') +
                    (previewCostume === null ? ' previewing-card' : '')
                  }
                  onClick={() => setPreviewCostume(null)}
                >
                  {gender && (
                    <img src={`/art/character/${gender}-leather.png`} alt="" />
                  )}
                  <h3>نمای تجهیزات</h3>
                  <p>زره و سلاح واقعی پهلوان را نشان بده.</p>
                  {costumeActive === null && <span>پوشیده‌شده</span>}
                </button>
                {COSTUMES.map((costume) => {
                  const owned = game.ownedCostumeIds.includes(costume.id);
                  const worn = costumeActive === costume.id;
                  return (
                    <button
                      type="button"
                      className={
                        'wardrobe-card' +
                        (worn && previewCostume === undefined ? ' worn' : '') +
                        (previewCostume === costume.id
                          ? ' previewing-card'
                          : '')
                      }
                      key={costume.id}
                      disabled={!owned}
                      onClick={() => setPreviewCostume(costume.id)}
                    >
                      {gender && (
                        <img
                          src={`/art/character/${gender}-${costume.id}.png`}
                          alt=""
                        />
                      )}
                      <h3>{costume.name}</h3>
                      <p>{costume.description}</p>
                      {worn && <span>پوشیده‌شده</span>}
                    </button>
                  );
                })}
              </div>
              {previewCostume !== undefined && (
                <div className="item-actions wardrobe-actions">
                  <Button
                    disabled={!ready}
                    onClick={() =>
                      onAct({
                        type: 'wearCostume',
                        costumeId: previewCostume,
                      })
                    }
                  >
                    پوشیدن لباس
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setPreviewCostume(undefined)}
                  >
                    انصراف
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog open={!!sellItem} onOpenChange={() => setSellId(null)}>
        <DialogContent dir="rtl">
          <DialogTitle>فروش وسیله</DialogTitle>
          <DialogDescription>
            {sellItem
              ? `یک عدد ${sellItem.name} فروخته می‌شود و ${fa(Math.floor(sellItem.price * 0.4))} سکه می‌گیری.`
              : ''}
          </DialogDescription>
          <div className="item-actions">
            <Button
              disabled={!ready || !sellItem}
              onClick={() => {
                if (!sellItem) return;
                onAct({ type: 'sell', itemId: sellItem.id });
                setSellId(null);
              }}
            >
              تأیید فروش
            </Button>
            <Button variant="ghost" onClick={() => setSellId(null)}>
              انصراف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={editAppearance} onOpenChange={setEditAppearance}>
        <DialogContent dir="rtl" className="appearance-dialog">
          <DialogTitle>ویرایش ظاهر</DialogTitle>
          <DialogDescription>
            تغییر جنسیت رایگان است و پیشرفت، تجهیزات و پوشاک حفظ می‌شوند.
          </DialogDescription>
          <div className="gender-cards compact">
            {GENDERS.map((id) => (
              <label
                key={id}
                className={
                  'gender-card' + (draftGender === id ? ' selected' : '')
                }
              >
                <input
                  type="radio"
                  name="edit-gender"
                  value={id}
                  checked={draftGender === id}
                  onChange={() => setDraftGender(id)}
                />
                <img src={`/art/character/${id}-portrait.png`} alt="" />
                <span>{GENDER_NAMES[id]}</span>
              </label>
            ))}
          </div>
          <div className="setup-form">
            <Button
              disabled={!ready || !draftGender}
              onClick={() => {
                if (!draftGender) return;
                onAct({ type: 'setGender', gender: draftGender });
                setEditAppearance(false);
              }}
            >
              ثبت ظاهر
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
