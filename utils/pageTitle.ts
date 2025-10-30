import { User, UserRole } from '../types';

/**
 * Génère un titre de page contextualisé selon le rôle et les informations de l'utilisateur
 */
export const getContextualPageTitle = (
  baseTitle: string,
  user: User | null
): string => {
  if (!user) return baseTitle;

  const isLittoral = user.region === 'Littoral';
  const groupLabel = isLittoral ? 'Groupe' : 'District';
  const districtLabel = isLittoral ? 'District' : 'Localité';

  let context = '';

  switch (user.role) {
    case UserRole.CELL_LEADER:
      // Ex: "Rapport Hebdomadaire de Cellule du district de ZOGBO/groupe AGLA"
      if (user.district && user.group) {
        context = ` du ${districtLabel.toLowerCase()} de ${user.district}/${groupLabel.toLowerCase()} ${user.group}`;
      } else if (user.district) {
        context = ` du ${districtLabel.toLowerCase()} de ${user.district}`;
      } else if (user.group) {
        context = ` du ${groupLabel.toLowerCase()} ${user.group}`;
      }
      break;

    case UserRole.DISTRICT_PASTOR:
      // Ex: "Évolution des Cellules du district AGLA"
      if (user.district) {
        context = ` du ${districtLabel.toLowerCase()} ${user.district}`;
      }
      break;

    case UserRole.GROUP_PASTOR:
      // Ex: "Centre de Gestion Groupe ZOGBO"
      if (user.group) {
        context = ` ${groupLabel} ${user.group}`;
      }
      break;

    case UserRole.REGIONAL_PASTOR:
      // Ex: "Mon Équipe Région Littoral"
      if (user.region) {
        context = ` Région ${user.region}`;
      }
      break;

    case UserRole.NATIONAL_COORDINATOR:
      // Pas de contexte supplémentaire pour le coordinateur national
      break;
  }

  return `${baseTitle}${context}`;
};

/**
 * Génère une description contextuelle selon le rôle
 */
export const getContextualDescription = (
  baseDescription: string,
  user: User | null
): string => {
  if (!user) return baseDescription;

  const isLittoral = user.region === 'Littoral';
  const groupLabel = isLittoral ? 'groupe' : 'district';
  const districtLabel = isLittoral ? 'district' : 'localité';

  switch (user.role) {
    case UserRole.CELL_LEADER:
      if (user.cellName) {
        return `${baseDescription} Cellule: ${user.cellName}`;
      }
      break;

    case UserRole.DISTRICT_PASTOR:
      if (user.district) {
        return `${baseDescription} Responsable du ${districtLabel}: ${user.name}`;
      }
      break;

    case UserRole.GROUP_PASTOR:
      if (user.group) {
        return `${baseDescription} Responsable du ${groupLabel}: ${user.name}`;
      }
      break;

    case UserRole.REGIONAL_PASTOR:
      if (user.region) {
        return `${baseDescription} Responsable de la région: ${user.name}`;
      }
      break;
  }

  return baseDescription;
};
