"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Plus,
  ImagePlus,
  Check,
  ChevronRight,
  ScanLine,
  Trash2,
  X,
} from "./app-icons";
import Link, { navigate } from "./navigation";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { AppDialogContent } from "./app-dialog";
import { useRecords, saveRequest } from "@/lib/threefig/use-records";
import {
  skinAreas,
  skinRoutines,
  loadPhoto,
  preparePhoto,
  cropRegion,
  photoSummary,
  canComparePhotos,
  type SkinRecord,
  type PhotoAnalysis,
} from "@/lib/threefig/skin";
import { dayLabel } from "@/lib/threefig/metrics";
import { RecordsError } from "./signal-screens";
function photoMoment(value: string) {
  return (
    new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }) + " UTC"
  );
}
function SkinPage({
  title,
  eyebrow = "SKIN, IN CONTEXT",
  back = "/app/skin",
  backLabel = "Skin check-in",
  children,
}: {
  title: string;
  eyebrow?: string;
  back?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="detail-screen skin-screen">
      <Link className="detail-back" href={back}>
        <ArrowLeft size={17} />
        {backLabel}
      </Link>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
function SkinMetricLinks() {
  return (
    <div className="skin-metric-links">
      <Link href="/app/signals/skin-tone?view=yours">
        <span>
          Photo color variation
          <small>The color range within your selected area</small>
        </span>
        <ChevronRight size={16} />
      </Link>
      <Link href="/app/signals/skin-texture?view=yours">
        <span>
          Photo surface contrast
          <small>Light-and-dark detail in the image</small>
        </span>
        <ChevronRight size={16} />
      </Link>
      <Link href="/app/signals/skin-comfort?view=yours">
        <span>
          Skin comfort<small>How it feels, in your own words</small>
        </span>
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
export function SkinHome() {
  const { records, loading, error, reload } =
    useRecords<SkinRecord>("/api/skin");
  const last = records[0];
  return (
    <SkinPage
      title="Skin has a story, too."
      back="/app/you"
      backLabel="Back to You"
    >
      <p className="screen-subtitle">
        Notice what changes. Keep a little context.
      </p>
      <div className="skin-hero-panel">
        {last ? (
          <img
            src={last.photoUrl}
            alt={`Your saved ${last.area.toLowerCase()} skin area`}
            className="skin-hero-photo"
          />
        ) : (
          <span className="skin-camera-mark">
            <ScanLine size={54} strokeWidth={1} />
          </span>
        )}
        <p className="eyebrow">
          {last
            ? `LAST NOTICED · ${dayLabel(last.observedAt).toUpperCase()}`
            : "A MOMENT, NOT A SCORE"}
        </p>
        <h2>
          {last
            ? "A little perspective, kept."
            : "A photo. A feeling.\nA starting point."}
        </h2>
        <p>
          {last
            ? `${last.area} · ${last.routine}`
            : "Your skin, through your own lens."}
        </p>
      </div>
      <Link className="button full" href="/app/skin/capture">
        Take a skin photo <Camera size={18} />
      </Link>
      <p className="skin-privacy-note">
        Your photo is reviewed on your device first. You decide whether to save
        it.
      </p>
      {error && <RecordsError message={error} onRetry={reload} />}
      <div className="skin-history-links">
        <Link href="/app/skin/history">
          <span>
            Your photo history
            <small>
              {loading
                ? "Getting your check-ins…"
                : `${records.length} saved ${records.length === 1 ? "moment" : "moments"}`}
            </small>
          </span>
          <ArrowRight size={17} />
        </Link>
        <Link href="/app/skin/compare">
          <span>
            Two moments, side by side
            <small>
              {records.length >= 2
                ? "Compare photos of the same area"
                : "A comparison starts with two photos"}
            </small>
          </span>
          <ArrowRight size={17} />
        </Link>
      </div>
      <p className="eyebrow skin-section-label">
        A CLOSER LOOK, IF YOU WANT IT
      </p>
      <SkinMetricLinks />
      <details className="detail-disclosure">
        <summary>What a photo can tell us</summary>
        <p>
          3FIG describes color variation and surface contrast in a skin area you
          select. Light, focus, makeup, and camera settings can change these
          values. They are photo observations, not skin-health scores.
        </p>
        <p>
          We don’t infer hydration, elasticity, skin age, or a diagnosis from
          these photos. Your photo does not change 3FIG Age.
        </p>
      </details>
    </SkinPage>
  );
}
export function SkinCapture() {
  const [photo, setPhoto] = useState<Awaited<
      ReturnType<typeof loadPhoto>
    > | null>(null),
    [prepared, setPrepared] = useState<Awaited<
      ReturnType<typeof preparePhoto>
    > | null>(null),
    [stream, setStream] = useState<MediaStream | null>(null),
    [cameraReady, setCameraReady] = useState(false),
    [pending, setPending] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [focusX, setFocusX] = useState(50),
    [focusY, setFocusY] = useState(50),
    [area, setArea] = useState<string>(skinAreas[0]),
    [routine, setRoutine] = useState<string>(skinRoutines[0]),
    [feeling, setFeeling] = useState(""),
    [note, setNote] = useState("");
  const fileInput = useRef<HTMLInputElement>(null),
    nativeCamera = useRef<HTMLInputElement>(null),
    video = useRef<HTMLVideoElement>(null),
    tracks = useRef<MediaStream | null>(null),
    generation = useRef(0),
    saveId = useRef("");
  useEffect(
    () => () => {
      generation.current++;
      tracks.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  useEffect(() => {
    if (stream && video.current) {
      video.current.srcObject = stream;
      video.current
        .play()
        .catch(() =>
          setError(
            "The camera preview could not start. Choose a photo instead.",
          ),
        );
    }
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.url);
    },
    [photo],
  );
  useEffect(
    () => () => {
      if (prepared) URL.revokeObjectURL(prepared.preview);
    },
    [prepared],
  );
  function stopCamera() {
    generation.current++;
    tracks.current?.getTracks().forEach((t) => t.stop());
    tracks.current = null;
    setStream(null);
    setCameraReady(false);
    setPending(false);
  }
  async function openCamera() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      nativeCamera.current?.click();
      return;
    }
    const token = ++generation.current;
    setPending(true);
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      if (token !== generation.current) {
        next.getTracks().forEach((t) => t.stop());
        return;
      }
      tracks.current = next;
      setStream(next);
    } catch {
      if (token === generation.current)
        setError(
          "The camera isn’t available. Allow camera access in your browser, or choose a photo below.",
        );
    } finally {
      if (token === generation.current) setPending(false);
    }
  }
  async function accept(file?: File) {
    if (!file) return;
    stopCamera();
    const token = ++generation.current;
    setPending(true);
    setError("");
    setPrepared(null);
    try {
      const p = await loadPhoto(file);
      if (token !== generation.current) {
        URL.revokeObjectURL(p.url);
        return;
      }
      setPhoto(p);
      setFocusX(50);
      setFocusY(50);
      saveId.current = crypto.randomUUID();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (token === generation.current) setPending(false);
    }
  }
  async function capture() {
    const v = video.current;
    if (!v?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(v, 0, 0);
    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/jpeg", 0.9),
    );
    if (blob)
      await accept(new File([blob], "skin-photo.jpg", { type: "image/jpeg" }));
    else setError("The photo could not be captured. Please try again.");
  }
  async function analyze() {
    if (!photo) return;
    setPending(true);
    setError("");
    try {
      setPrepared(await preparePhoto(photo.image, focusX, focusY));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  async function save() {
    if (!prepared) return;
    setSaving(true);
    setError("");
    try {
      const form = new FormData();
      form.set("photo", prepared.blob, "skin-check-in.jpg");
      form.set(
        "record",
        JSON.stringify({
          id: saveId.current,
          observedAt: new Date().toISOString(),
          area,
          routine,
          feeling,
          note,
          analysis: prepared.analysis,
        }),
      );
      const saved = await saveRequest("/api/skin", {
        method: "POST",
        body: form,
      });
      navigate(`/app/skin/record/${saved.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }
  const crop = photo
    ? cropRegion(
        photo.image.naturalWidth,
        photo.image.naturalHeight,
        focusX,
        focusY,
      )
    : null;
  const chooser = (
    <>
      <input
        ref={fileInput}
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
        aria-label="Choose a skin photo"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={nativeCamera}
        className="sr-only"
        tabIndex={-1}
        type="file"
        accept="image/*"
        capture="user"
        aria-label="Take a skin photo"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </>
  );
  return (
    <SkinPage
      title={
        prepared
          ? "A little closer."
          : photo
            ? "Choose your skin area."
            : stream
              ? "A quiet, clear view."
              : "Start with a photo."
      }
      eyebrow={
        prepared
          ? "YOUR PHOTO OBSERVATIONS"
          : photo
            ? "02 / A CLOSER LOOK"
            : "01 / YOUR OWN LENS"
      }
    >
      {chooser}
      {error && (
        <p className="form-error skin-capture-error" role="alert">
          {error}
        </p>
      )}
      {prepared ? (
        <>
          <p className="screen-subtitle">
            These observations describe the selected photo.
          </p>
          <img
            className="analyzed-photo"
            src={prepared.preview}
            alt={`Selected ${area.toLowerCase()} area for review`}
          />
          <PhotoObservations analysis={prepared.analysis} />
          <div className="photo-context">
            <p>
              <span>Area</span>
              {area}
            </p>
            <p>
              <span>Conditions</span>
              {routine}
            </p>
            <p>
              <span>How it felt</span>
              {feeling
                ? [
                    "Very uncomfortable",
                    "Uncomfortable",
                    "In between",
                    "Comfortable",
                    "Very comfortable",
                  ][Number(feeling) - 1]
                : "Not added"}
            </p>
          </div>
          <button className="button full" disabled={saving} onClick={save}>
            {saving ? "Saving your moment…" : "Save photo & observations"}
            {!saving && <Check size={17} />}
          </button>
          <p className="skin-privacy-note">
            Only this selected area and your notes are saved to your private
            3FIG account. The original photo is not uploaded.
          </p>
          <button
            className="text-link skin-retake"
            disabled={saving}
            onClick={() => setPrepared(null)}
          >
            <ArrowLeft size={15} /> Adjust photo or details
          </button>
        </>
      ) : photo ? (
        <>
          <p className="screen-subtitle">
            Keep only skin inside the inner box. Leave out eyes, lips, and hair.
          </p>
          <div
            className="photo-crop"
            style={{
              aspectRatio: photo.image.naturalWidth / photo.image.naturalHeight,
              width: `min(100%, ${(320 * photo.image.naturalWidth) / photo.image.naturalHeight}px)`,
            }}
          >
            <img src={photo.url} alt="Photo to select a skin area from" />
            <span
              className="photo-crop-guide"
              aria-hidden="true"
              style={{
                inset: "auto",
                left: `${(crop!.x / photo.image.naturalWidth) * 100}%`,
                top: `${(crop!.y / photo.image.naturalHeight) * 100}%`,
                width: `${(crop!.size / photo.image.naturalWidth) * 100}%`,
                height: `${(crop!.size / photo.image.naturalHeight) * 100}%`,
              }}
            />
          </div>
          <div className="crop-controls">
            <div
              className="crop-position"
              role="group"
              aria-label="Move selected area horizontally"
            >
              <span>Left to right</span>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[focusX]}
                onValueChange={(v) => setFocusX(v[0])}
                aria-label="Horizontal crop position"
              />
            </div>
            <div
              className="crop-position"
              role="group"
              aria-label="Move selected area vertically"
            >
              <span>Top to bottom</span>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[focusY]}
                onValueChange={(v) => setFocusY(v[0])}
                aria-label="Vertical crop position"
              />
            </div>
          </div>
          <div className="entry-form photo-review-form">
            <label htmlFor="skin-area">Which area?</label>
            <select
              id="skin-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              {skinAreas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <label htmlFor="skin-routine">When was it taken?</label>
            <select
              id="skin-routine"
              value={routine}
              onChange={(e) => setRoutine(e.target.value)}
            >
              {skinRoutines.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <label htmlFor="skin-feeling">
              How does it feel? <small>optional</small>
            </label>
            <select
              id="skin-feeling"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
            >
              <option value="">Leave this out</option>
              {[
                "Very uncomfortable",
                "Uncomfortable",
                "In between",
                "Comfortable",
                "Very comfortable",
              ].map((v, i) => (
                <option key={v} value={i + 1}>
                  {v}
                </option>
              ))}
            </select>
            <label htmlFor="skin-note">
              Anything you noticed? <small>optional</small>
            </label>
            <textarea
              id="skin-note"
              maxLength={500}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Feeling dry, a new product, a different routine…"
            />
          </div>
          <button className="button full" disabled={pending} onClick={analyze}>
            {pending ? "Looking at your photo…" : "Analyze this area"}
            <ScanLine size={17} />
          </button>
          <p className="skin-privacy-note">
            Analysis happens on your device. Nothing is saved yet.
          </p>
          <button
            className="text-link skin-retake"
            disabled={pending}
            onClick={() => {
              setPhoto(null);
              setError("");
            }}
          >
            Choose a different photo
          </button>
        </>
      ) : (
        <>
          <p className="screen-subtitle">
            A close-up of one area is all you need.
          </p>
          {stream ? (
            <>
              <div className="camera-live">
                <video
                  ref={video}
                  autoPlay
                  muted
                  playsInline
                  onLoadedMetadata={() => setCameraReady(true)}
                />
                <span className="camera-guide" aria-hidden="true" />
                <button
                  className="camera-close"
                  onClick={stopCamera}
                  aria-label="Close camera"
                >
                  <X size={19} />
                </button>
              </div>
              <button
                className="button full"
                onClick={capture}
                disabled={!cameraReady}
              >
                Take photo <Camera size={18} />
              </button>
            </>
          ) : (
            <div className="capture-intro">
              <span className="skin-camera-mark">
                <Camera size={46} strokeWidth={1} />
              </span>
              <p>
                Same area.
                <br />
                Similar light.
                <br />
                <em>A little perspective.</em>
              </p>
            </div>
          )}
          <ol className="photo-guidance">
            <li>
              <span>01</span>
              <div>
                Find soft, even light.
                <small>Avoid flash and strong shadows.</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                Keep it natural.
                <small>No filters. Remove makeup from the area.</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                Get close. Keep it clear.
                <small>Use the same area and routine next time.</small>
              </div>
            </li>
          </ol>
          {!stream && (
            <button
              className="button full"
              disabled={pending}
              onClick={openCamera}
            >
              {pending ? "Opening camera…" : "Open camera"}
              <Camera size={18} />
            </button>
          )}
          <button
            className="button button-light full photo-upload"
            disabled={pending}
            onClick={() => fileInput.current?.click()}
          >
            Choose a photo <ImagePlus size={18} />
          </button>
          <p className="skin-privacy-note">
            Camera access begins only when you choose. No photo is uploaded
            until you save.
          </p>
          <p className="fine-print">
            Photo observations, not diagnosis. If a skin change concerns you, a
            dermatologist can assess it.
          </p>
        </>
      )}
    </SkinPage>
  );
}
function PhotoObservations({ analysis: a }: { analysis: PhotoAnalysis }) {
  return (
    <div className="photo-observations">
      <p
        className={`photo-quality ${a.quality === "limited" ? "limited" : ""}`}
      >
        {photoSummary(a)}
      </p>
      <div>
        <span>
          Color variation<small>The spread of colors in this area</small>
        </span>
        <strong>
          {a.colorVariation.toFixed(1)}
          <small>RGB units</small>
        </strong>
      </div>
      <div>
        <span>
          Surface contrast<small>Light-and-dark detail in the image</small>
        </span>
        <strong>
          {a.surfaceContrast.toFixed(1)}
          <small>luma units</small>
        </strong>
      </div>
      <p className="fine-print">
        Higher or lower does not mean healthier skin. These are image
        measurements, not assessments of redness, pores, wrinkles, or hydration.
      </p>
    </div>
  );
}
export function SkinHistory() {
  const { records, loading, error, reload } =
    useRecords<SkinRecord>("/api/skin");
  const [area, setArea] = useState("All areas");
  const shown = records.filter((r) => area === "All areas" || r.area === area);
  return (
    <SkinPage title="A few moments, kept." eyebrow="YOUR PHOTO HISTORY">
      <p className="screen-subtitle">
        A little distance can bring perspective.
      </p>
      <label className="compact-select skin-history-filter">
        Skin area
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          {["All areas", ...skinAreas].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      {error ? (
        <RecordsError message={error} onRetry={reload} />
      ) : loading ? (
        <p className="empty-records" role="status">
          Getting your photos…
        </p>
      ) : shown.length ? (
        <div className="skin-photo-list">
          {shown.map((r) => (
            <Link href={`/app/skin/record/${r.id}`} key={r.id}>
              <img
                src={r.photoUrl}
                alt={`${r.area} on ${dayLabel(r.observedAt)}`}
                loading="lazy"
              />
              <span>
                {dayLabel(r.observedAt)}
                <small>
                  {r.area}
                  <br />
                  {r.routine}
                </small>
              </span>
              <ChevronRight size={17} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-records">
          <Camera size={32} strokeWidth={1.2} />
          <p>No moments here yet.</p>
          <small>
            Your first photo is a starting point, not something to improve.
          </small>
        </div>
      )}
      <Link className="button full" href="/app/skin/capture">
        Add a skin check-in <Plus size={22} />
      </Link>
      <Link className="detail-next" href="/app/skin/compare">
        Compare two moments
        <ArrowRight size={17} />
      </Link>
      <p className="fine-print">
        Saved photos are private to your signed-in account. Open a record to
        remove its photo and observations.
      </p>
    </SkinPage>
  );
}
export function SkinRecordScreen({ recordId }: { recordId: string }) {
  const { records, loading, error, reload } =
      useRecords<SkinRecord>("/api/skin"),
    [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [removeError, setRemoveError] = useState("");
  const record = records.find((r) => r.id === recordId);
  async function remove() {
    setBusy(true);
    setRemoveError("");
    try {
      await saveRequest(`/api/skin/${recordId}`, { method: "DELETE" });
      navigate("/app/skin/history");
    } catch (e) {
      setRemoveError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <SkinPage
      title={
        record
          ? `Noticed on ${dayLabel(record.observedAt)}.`
          : "Your saved moment."
      }
      back="/app/skin/history"
      backLabel="Photo history"
    >
      {error ? (
        <RecordsError message={error} onRetry={reload} />
      ) : loading ? (
        <p className="empty-records" role="status">
          Getting your moment…
        </p>
      ) : !record ? (
        <div className="empty-records">
          <p>This photo is no longer here.</p>
          <Link href="/app/skin/capture">
            Take a new photo <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <p className="screen-subtitle">
            {record.area} · {record.routine}
          </p>
          <img
            className="saved-skin-photo"
            src={record.photoUrl}
            alt={`Saved ${record.area.toLowerCase()} area`}
          />
          <PhotoObservations analysis={record.analysis} />
          {record.feeling && (
            <div className="skin-feeling-record">
              <span className="eyebrow">HOW IT FELT</span>
              <p>
                {
                  [
                    "Very uncomfortable",
                    "Uncomfortable",
                    "In between",
                    "Comfortable",
                    "Very comfortable",
                  ][Number(record.feeling) - 1]
                }
              </p>
            </div>
          )}
          {record.note && <p className="skin-note">“{record.note}”</p>}
          <Link className="button full" href="/app/skin/compare">
            Compare with another moment <ArrowRight size={16} />
          </Link>
          <SkinMetricLinks />
          <button
            className="text-link skin-remove"
            onClick={() => setConfirm(true)}
          >
            <Trash2 size={15} /> Remove this photo
          </button>
          <Dialog
            open={confirm}
            onOpenChange={(v) => {
              if (!busy) setConfirm(v);
            }}
          >
            <AppDialogContent>
              <p className="eyebrow">YOURS TO KEEP. YOURS TO REMOVE.</p>
              <DialogTitle>Remove this moment?</DialogTitle>
              <DialogDescription>
                The photo, its observations, and its note will be removed from
                your saved history.
              </DialogDescription>
              {removeError && <p role="alert">{removeError}</p>}
              <button className="button full" disabled={busy} onClick={remove}>
                {busy ? "Removing…" : "Remove photo & observations"}
              </button>
              <button
                className="button button-light full"
                disabled={busy}
                onClick={() => setConfirm(false)}
              >
                Keep my photo
              </button>
            </AppDialogContent>
          </Dialog>
        </>
      )}
    </SkinPage>
  );
}
export function SkinCompare() {
  const { records, loading, error, reload } =
    useRecords<SkinRecord>("/api/skin");
  const [area, setArea] = useState<string>(""),
    [firstId, setFirstId] = useState(""),
    [secondId, setSecondId] = useState("");
  const activeArea = area || records[0]?.area || skinAreas[0],
    eligible = records.filter((r) => r.area === activeArea),
    a = eligible.find((r) => r.id === firstId) || eligible[1],
    b = eligible.find((r) => r.id === secondId) || eligible[0],
    pair =
      a && b && a.id !== b.id
        ? [a, b].sort((x, y) => x.observedAt.localeCompare(y.observedAt))
        : null,
    comparable = !!pair && canComparePhotos(pair[0], pair[1]);
  return (
    <SkinPage title="Two moments. A little perspective." eyebrow="SIDE BY SIDE">
      <p className="screen-subtitle">
        Similar conditions make a fairer comparison.
      </p>
      {error ? (
        <RecordsError message={error} onRetry={reload} />
      ) : loading ? (
        <p className="empty-records" role="status">
          Getting your photos…
        </p>
      ) : (
        <>
          <label className="compact-select skin-history-filter">
            Same skin area
            <select
              value={activeArea}
              onChange={(e) => {
                setArea(e.target.value);
                setFirstId("");
                setSecondId("");
              }}
            >
              {skinAreas.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {eligible.length < 2 ? (
            <div className="empty-records">
              <ScanLine size={34} strokeWidth={1} />
              <p>A comparison starts with two.</p>
              <small>
                Add another photo of your {activeArea.toLowerCase()} under
                similar light and at the same point in your routine.
              </small>
            </div>
          ) : (
            <>
              <div className="compare-pickers">
                <label>
                  First photo
                  <select
                    value={a?.id || ""}
                    onChange={(e) => setFirstId(e.target.value)}
                  >
                    {eligible.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.id === b?.id}>
                        {photoMoment(r.observedAt)} · {r.routine}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Second photo
                  <select
                    value={b?.id || ""}
                    onChange={(e) => setSecondId(e.target.value)}
                  >
                    {eligible.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.id === a?.id}>
                        {photoMoment(r.observedAt)} · {r.routine}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {pair && (
                <>
                  <div className="skin-compare-photos">
                    {pair.map((r, i) => (
                      <figure key={r.id}>
                        <img
                          src={r.photoUrl}
                          alt={`${i === 0 ? "Earlier" : "Later"} ${r.area.toLowerCase()} photo`}
                        />
                        <figcaption>
                          <span>{i === 0 ? "Earlier" : "Later"}</span>
                          <strong>{dayLabel(r.observedAt)}</strong>
                          <small>{r.routine}</small>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className="compare-observation">
                    {comparable
                      ? "A similar setup. A moment worth revisiting."
                      : "Different conditions. Keep these as two separate moments."}
                  </p>
                  {comparable ? (
                    <div className="comparison-values">
                      {[
                        {
                          label: "Color variation",
                          key: "colorVariation",
                          unit: "RGB units",
                        },
                        {
                          label: "Surface contrast",
                          key: "surfaceContrast",
                          unit: "luma units",
                        },
                      ].map(({ label, key, unit }) => (
                        <div key={key}>
                          <span>
                            {label}
                            <small>{unit}</small>
                          </span>
                          <strong>
                            {pair[0].analysis[key as "colorVariation"].toFixed(
                              1,
                            )}{" "}
                            <ArrowRight size={14} />{" "}
                            {pair[1].analysis[key as "colorVariation"].toFixed(
                              1,
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="fine-print">
                      Lighting, routine, or photo quality differs, so we have
                      left out a numerical change. You can still revisit both
                      photos.
                    </p>
                  )}
                  <p className="fine-print">
                    A change in the photo does not prove a change in skin
                    health. Compare the pictures alongside how your skin felt.
                  </p>
                </>
              )}
            </>
          )}
        </>
      )}
      <Link className="button full" href="/app/skin/capture">
        Add another moment <Camera size={17} />
      </Link>
    </SkinPage>
  );
}
