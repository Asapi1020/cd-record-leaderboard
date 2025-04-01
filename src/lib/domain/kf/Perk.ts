export const PERK_LIST = [
	"kfgame.kfperk_berserker",
	"kfgame.kfperk_commando",
	"kfgame.kfperk_support",
	"kfgame.kfperk_fieldmedic",
	"kfgame.kfperk_gunslinger",
	"kfgame.kfperk_sharpshooter",
	"kfgame.kfperk_swat",
	"kfgame.kfperk_demolitionist",
	"kfgame.kfperk_firebug",
	"kfgame.kfperk_survivalist",
];

export const perkColors = (perk: string): string => {
	switch (perk.toLowerCase()) {
		case "kfgame.kfperk_berserker":
			return "#df37df"; // Magenta
		case "kfgame.kfperk_commando":
			return "#277ded"; // Blue
		case "kfgame.kfperk_support":
			return "#1bbf1b"; // Green
		case "kfgame.kfperk_fieldmedic":
			return "#eae42a"; // Yellow
		case "kfgame.kfperk_gunslinger":
			return "#c33c3c"; // Red
		case "kfgame.kfperk_sharpshooter":
			return "#6dcece"; // Cyan
		case "kfgame.kfperk_swat":
			return "#ac53ac"; // Purple
		case "kfgame.kfperk_demolitionist":
			return "#d98b38"; // Orange
		case "kfgame.kfperk_firebug":
			return "#f3b7ee"; // Pink
		case "kfgame.kfperk_survivalist":
			return "#986666"; // Brown
		default:
			return "#FFFFFF"; // White for unknown perks
	}
};
