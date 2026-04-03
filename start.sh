#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  start.sh — FaceGroup UI launcher
#  Usage: ./start.sh
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Colors ─────────────────────────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
DIM="\033[2m"

log()    { echo -e "${CYAN}▸${RESET} $*"; }
ok()     { echo -e "${GREEN}✔${RESET} $*"; }
warn()   { echo -e "${YELLOW}⚠${RESET} $*"; }
error()  { echo -e "${RED}✖${RESET} $*"; }
banner() { echo -e "\n${BOLD}${CYAN}$*${RESET}\n"; }

# ── Pre-flight checks ───────────────────────────────────────────────────────
banner "FaceGroup UI — Démarrage"

if ! command -v docker &>/dev/null; then
  error "Docker n'est pas installé ou introuvable dans le PATH."
  exit 1
fi

if ! docker compose version &>/dev/null 2>&1; then
  error "docker compose (plugin) est requis. Installez Docker Desktop ou le plugin compose."
  exit 1
fi

# ── Cleanup function (called on exit) ──────────────────────────────────────
cleanup() {
  echo ""
  warn "Signal reçu — nettoyage en cours…"
  docker compose down --remove-orphans 2>/dev/null || true
  ok "Conteneurs arrêtés proprement."
}
trap cleanup INT TERM EXIT

# ── Step 1: Stop & clean existing containers ───────────────────────────────
log "Arrêt des conteneurs existants…"
docker compose down --volumes --remove-orphans 2>/dev/null || true
ok "Conteneurs précédents supprimés."

# ── Step 2: Prune dangling resources (non-blocking) ────────────────────────
log "Nettoyage des ressources Docker orphelines…"
docker system prune -f --filter "label=com.docker.compose.project=facegroup-ui" 2>/dev/null || \
  docker system prune -f 2>/dev/null || true
ok "Nettoyage terminé."

# ── Step 3: Build & launch ─────────────────────────────────────────────────
banner "Build & lancement…"
log "Construction de l'image et démarrage du service frontend…"
log "${DIM}(première exécution ~2-3 min selon la connexion)${RESET}"
echo ""

docker compose up --build

# Note: cleanup() is triggered automatically via trap on EXIT
