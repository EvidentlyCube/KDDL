import * as PIXI from 'pixi.js';
import {S} from "./S";
import {BitmapDataWritable, CanvasImageSource, StyleName, StyleTilesets} from "./C";
import {UtilsBitmapData} from "../src.framework/net/retrocade/utils/UtilsBitmapData";
import {Gfx} from "./game/global/Gfx";
import {F} from "./F";

export const T = {
        TILES : [] as PIXI.Rectangle[],

        TI_DOOR_Y_SE         : 0,
        TI_DOOR_Y_SEW        : 1,
        TI_DOOR_Y_SW         : 2,
        TI_DOOR_Y_NSE        : 3,
        TI_DOOR_Y_NSEW       : 4,
        TI_DOOR_Y_NSW        : 5,
        TI_DOOR_Y_NE         : 6,
        TI_DOOR_Y_NEW        : 7,
        TI_DOOR_Y_NW         : 8,
        TI_DOOR_Y_EW         : 9,
        TI_DOOR_Y_NS         : 10,
        TI_DOOR_Y_W          : 11,
        TI_DOOR_Y_E          : 12,
        TI_DOOR_Y_N          : 13,
        TI_DOOR_Y_S          : 14,
        TI_DOOR_Y            : 15,

        TI_POTION_M          : 16,
        TI_BRAIN             : 17,

        TI_DOOR_YO_SE         : 18,
        TI_DOOR_YO_SEW        : 19,
        TI_DOOR_YO_SW         : 20,
        TI_DOOR_YO_NSE        : 21,
        TI_DOOR_YO_NSEW       : 22,
        TI_DOOR_YO_NSW        : 23,
        TI_DOOR_YO_NE         : 24,
        TI_DOOR_YO_NEW        : 25,
        TI_DOOR_YO_NW         : 26,
        TI_DOOR_YO_EW         : 27,
        TI_DOOR_YO_NS         : 28,
        TI_DOOR_YO_W          : 29,
        TI_DOOR_YO_E          : 30,
        TI_DOOR_YO_N          : 31,
        TI_DOOR_YO_S          : 32,
        TI_DOOR_YO            : 33,

        TI_POTION_I          : 34,
        TI_BRAIN_A           : 35,

        TI_DOOR_G_SE         : 36,
        TI_DOOR_G_SEW        : 37,
        TI_DOOR_G_SW         : 38,
        TI_DOOR_G_NSE        : 39,
        TI_DOOR_G_NSEW       : 40,
        TI_DOOR_G_NSW        : 41,
        TI_DOOR_G_NE         : 42,
        TI_DOOR_G_NEW        : 43,
        TI_DOOR_G_NW         : 44,
        TI_DOOR_G_EW         : 45,
        TI_DOOR_G_NS         : 46,
        TI_DOOR_G_W          : 47,
        TI_DOOR_G_E          : 48,
        TI_DOOR_G_N          : 49,
        TI_DOOR_G_S          : 50,
        TI_DOOR_G            : 51,

        TI_REGG_N            : 52,
        TI_REGG_AN           : 53,

        TI_DOOR_GO_SE         : 54,
        TI_DOOR_GO_SEW        : 55,
        TI_DOOR_GO_SW         : 56,
        TI_DOOR_GO_NSE        : 57,
        TI_DOOR_GO_NSEW       : 58,
        TI_DOOR_GO_NSW        : 59,
        TI_DOOR_GO_NE         : 60,
        TI_DOOR_GO_NEW        : 61,
        TI_DOOR_GO_NW         : 62,
        TI_DOOR_GO_EW         : 63,
        TI_DOOR_GO_NS         : 64,
        TI_DOOR_GO_W          : 65,
        TI_DOOR_GO_E          : 66,
        TI_DOOR_GO_N          : 67,
        TI_DOOR_GO_S          : 68,
        TI_DOOR_GO            : 69,

        TI_REGG_NW            : 70,
        TI_REGG_ANW           : 71,

        TI_DOOR_R_SE         : 72,
        TI_DOOR_R_SEW        : 73,
        TI_DOOR_R_SW         : 74,
        TI_DOOR_R_NSE        : 75,
        TI_DOOR_R_NSEW       : 76,
        TI_DOOR_R_NSW        : 77,
        TI_DOOR_R_NE         : 78,
        TI_DOOR_R_NEW        : 79,
        TI_DOOR_R_NW         : 80,
        TI_DOOR_R_EW         : 81,
        TI_DOOR_R_NS         : 82,
        TI_DOOR_R_W          : 83,
        TI_DOOR_R_E          : 84,
        TI_DOOR_R_N          : 85,
        TI_DOOR_R_S          : 86,
        TI_DOOR_R            : 87,

        TI_REGG_W           : 88,
        TI_REGG_AW          : 89,

        TI_DOOR_RO_SE         : 90,
        TI_DOOR_RO_SEW        : 91,
        TI_DOOR_RO_SW         : 92,
        TI_DOOR_RO_NSE        : 93,
        TI_DOOR_RO_NSEW       : 94,
        TI_DOOR_RO_NSW        : 95,
        TI_DOOR_RO_NE         : 96,
        TI_DOOR_RO_NEW        : 97,
        TI_DOOR_RO_NW         : 98,
        TI_DOOR_RO_EW         : 99,
        TI_DOOR_RO_NS         : 100,
        TI_DOOR_RO_W          : 101,
        TI_DOOR_RO_E          : 102,
        TI_DOOR_RO_N          : 103,
        TI_DOOR_RO_S          : 104,
        TI_DOOR_RO            : 105,

        TI_REGG_SW             : 106,
        TI_REGG_ASW            : 107,

        TI_DOOR_C_SE         : 108,
        TI_DOOR_C_SEW        : 109,
        TI_DOOR_C_SW         : 110,
        TI_DOOR_C_NSE        : 111,
        TI_DOOR_C_NSEW       : 112,
        TI_DOOR_C_NSW        : 113,
        TI_DOOR_C_NE         : 114,
        TI_DOOR_C_NEW        : 115,
        TI_DOOR_C_NW         : 116,
        TI_DOOR_C_EW         : 117,
        TI_DOOR_C_NS         : 118,
        TI_DOOR_C_W          : 119,
        TI_DOOR_C_E          : 120,
        TI_DOOR_C_N          : 121,
        TI_DOOR_C_S          : 122,
        TI_DOOR_C            : 123,

        TI_DOOR_CO_SE         : 126,
        TI_DOOR_CO_SEW        : 127,
        TI_DOOR_CO_SW         : 128,
        TI_DOOR_CO_NSE        : 129,
        TI_DOOR_CO_NSEW       : 130,
        TI_DOOR_CO_NSW        : 131,
        TI_DOOR_CO_NE         : 132,
        TI_DOOR_CO_NEW        : 133,
        TI_DOOR_CO_NW         : 134,
        TI_DOOR_CO_EW         : 135,
        TI_DOOR_CO_NS         : 136,
        TI_DOOR_CO_W          : 137,
        TI_DOOR_CO_E          : 138,
        TI_DOOR_CO_N          : 139,
        TI_DOOR_CO_S          : 140,
        TI_DOOR_CO            : 141,

        TI_ORB                : 143,

        TI_DOOR_B_SE         : 144,
        TI_DOOR_B_SEW        : 145,
        TI_DOOR_B_SW         : 146,
        TI_DOOR_B_NSE        : 147,
        TI_DOOR_B_NSEW       : 148,
        TI_DOOR_B_NSW        : 149,
        TI_DOOR_B_NE         : 150,
        TI_DOOR_B_NEW        : 151,
        TI_DOOR_B_NW         : 152,
        TI_DOOR_B_EW         : 153,
        TI_DOOR_B_NS         : 154,
        TI_DOOR_B_W          : 155,
        TI_DOOR_B_E          : 156,
        TI_DOOR_B_N          : 157,
        TI_DOOR_B_S          : 158,
        TI_DOOR_B            : 159,

        TI_DOOR_BO_SE         : 162,
        TI_DOOR_BO_SEW        : 163,
        TI_DOOR_BO_SW         : 164,
        TI_DOOR_BO_NSE        : 165,
        TI_DOOR_BO_NSEW       : 166,
        TI_DOOR_BO_NSW        : 167,
        TI_DOOR_BO_NE         : 168,
        TI_DOOR_BO_NEW        : 169,
        TI_DOOR_BO_NW         : 170,
        TI_DOOR_BO_EW         : 171,
        TI_DOOR_BO_NS         : 172,
        TI_DOOR_BO_W          : 173,
        TI_DOOR_BO_E          : 174,
        TI_DOOR_BO_N          : 175,
        TI_DOOR_BO_S          : 176,
        TI_DOOR_BO            : 177,

        TI_MASTER_WALL        : 179,

        TI_BEETHRO_NW         : 180,
        TI_BEETHRO_N          : 181,
        TI_BEETHRO_NE         : 182,
        TI_BEETHRO_W          : 183,
        TI_BEETHRO_E          : 185,
        TI_BEETHRO_SW         : 186,
        TI_BEETHRO_S          : 187,
        TI_BEETHRO_SE         : 188,

        TI_MIMIC_NW           : 189,
        TI_MIMIC_N            : 190,
        TI_MIMIC_NE           : 191,
        TI_MIMIC_W            : 192,
        TI_MIMIC_E            : 194,
        TI_MIMIC_SW           : 195,
        TI_MIMIC_S            : 196,
        TI_MIMIC_SE           : 197,

        TI_BEETHRO_SWORD_NW         : 198,
        TI_BEETHRO_SWORD_N          : 199,
        TI_BEETHRO_SWORD_NE         : 200,
        TI_BEETHRO_SWORD_W          : 201,
        TI_BEETHRO_SWORD_E          : 203,
        TI_BEETHRO_SWORD_SW         : 204,
        TI_BEETHRO_SWORD_S          : 205,
        TI_BEETHRO_SWORD_SE         : 206,

        TI_MIMIC_SWORD_NW         : 207,
        TI_MIMIC_SWORD_N          : 208,
        TI_MIMIC_SWORD_NE         : 209,
        TI_MIMIC_SWORD_W          : 210,
        TI_MIMIC_SWORD_E          : 212,
        TI_MIMIC_SWORD_SW         : 213,
        TI_MIMIC_SWORD_S          : 214,
        TI_MIMIC_SWORD_SE         : 215,

        TI_SPIDER_NW          : 216,
        TI_SPIDER_N           : 217,
        TI_SPIDER_NE          : 218,
        TI_SPIDER_W           : 219,
        TI_SPIDER_E           : 221,
        TI_SPIDER_SW          : 222,
        TI_SPIDER_S           : 223,
        TI_SPIDER_SE          : 224,

        TI_ROACH_NW          : 225,
        TI_ROACH_N           : 226,
        TI_ROACH_NE          : 227,
        TI_ROACH_W           : 228,
        TI_ROACH_E           : 230,
        TI_ROACH_SW          : 231,
        TI_ROACH_S           : 232,
        TI_ROACH_SE          : 233,

        TI_SPIDER_ANW          : 234,
        TI_SPIDER_AN           : 235,
        TI_SPIDER_ANE          : 236,
        TI_SPIDER_AW           : 237,
        TI_SPIDER_AE           : 239,
        TI_SPIDER_ASW          : 240,
        TI_SPIDER_AS           : 241,
        TI_SPIDER_ASE          : 242,

        TI_ROACH_ANW          : 243,
        TI_ROACH_AN           : 244,
        TI_ROACH_ANE          : 245,
        TI_ROACH_AW           : 246,
        TI_ROACH_AE           : 248,
        TI_ROACH_ASW          : 249,
        TI_ROACH_AS           : 250,
        TI_ROACH_ASE          : 251,

        TI_RQUEEN_NW          : 252,
        TI_RQUEEN_N           : 253,
        TI_RQUEEN_NE          : 254,
        TI_RQUEEN_W           : 255,
        TI_RQUEEN_E           : 257,
        TI_RQUEEN_SW          : 258,
        TI_RQUEEN_S           : 259,
        TI_RQUEEN_SE          : 260,

        TI_EEYE_NW          : 261,
        TI_EEYE_N           : 262,
        TI_EEYE_NE          : 263,
        TI_EEYE_W           : 264,
        TI_EEYE_E           : 266,
        TI_EEYE_SW          : 267,
        TI_EEYE_S           : 268,
        TI_EEYE_SE          : 269,

        TI_RQUEEN_ANW          : 270,
        TI_RQUEEN_AN           : 271,
        TI_RQUEEN_ANE          : 272,
        TI_RQUEEN_AW           : 273,
        TI_RQUEEN_AE           : 275,
        TI_RQUEEN_ASW          : 276,
        TI_RQUEEN_AS           : 277,
        TI_RQUEEN_ASE          : 278,

        TI_EEYE_ANW          : 279,
        TI_EEYE_AN           : 280,
        TI_EEYE_ANE          : 281,
        TI_EEYE_AW           : 282,
        TI_EEYE_AE           : 284,
        TI_EEYE_ASW          : 285,
        TI_EEYE_AS           : 286,
        TI_EEYE_ASE          : 287,

        TI_WWING_NW          : 288,
        TI_WWING_N           : 289,
        TI_WWING_NE          : 290,
        TI_WWING_W           : 291,
        TI_WWING_E           : 293,
        TI_WWING_SW          : 294,
        TI_WWING_S           : 295,
        TI_WWING_SE          : 296,

        TI_GOBLIN_NW          : 297,
        TI_GOBLIN_N           : 298,
        TI_GOBLIN_NE          : 299,
        TI_GOBLIN_W           : 300,
        TI_GOBLIN_E           : 302,
        TI_GOBLIN_SW          : 303,
        TI_GOBLIN_S           : 304,
        TI_GOBLIN_SE          : 305,

        TI_WWING_ANW          : 306,
        TI_WWING_AN           : 307,
        TI_WWING_ANE          : 308,
        TI_WWING_AW           : 309,
        TI_WWING_AE           : 311,
        TI_WWING_ASW          : 312,
        TI_WWING_AS           : 313,
        TI_WWING_ASE          : 314,

        TI_GOBLIN_ANW          : 315,
        TI_GOBLIN_AN           : 316,
        TI_GOBLIN_ANE          : 317,
        TI_GOBLIN_AW           : 318,
        TI_GOBLIN_AE           : 320,
        TI_GOBLIN_ASW          : 321,
        TI_GOBLIN_AS           : 322,
        TI_GOBLIN_ASE          : 323,

        TI_TMOTHER_WO          : 324,
        TI_TMOTHER_EO          : 325,

        TI_TAR_SE              : 331,
        TI_TAR_SEW             : 332,
        TI_TAR_SW              : 333,
        TI_TAR_INW             : 334,
        TI_TAR_INE             : 335,

        TI_SNK_SE              : 336,
        TI_SNK_SW              : 337,
        TI_SNKH_N              : 338,
        TI_SNKH_E              : 339,
        TI_SNKH_S              : 340,
        TI_SNKH_W              : 341,

        TI_TMOTHER_WC          : 342,
        TI_TMOTHER_EC          : 343,

        TI_TAR_NSE             : 349,
        TI_TAR_NSEW            : 350,
        TI_TAR_NSW             : 351,
        TI_TAR_ISW             : 352,
        TI_TAR_ISE             : 353,

        TI_SNK_NE              : 354,
        TI_SNK_NW              : 355,
        TI_SNKH_AN             : 356,
        TI_SNKH_AE             : 357,
        TI_SNKH_AS             : 358,
        TI_SNKH_AW             : 359,

        TI_SCROLL              : 360,
        TI_CHECKPOINT          : 361,

        TI_TAR_NE              : 367,
        TI_TAR_NEW             : 368,
        TI_TAR_NW              : 369,
        TI_TAR_INWSE           : 370,
        TI_TAR_INESW           : 371,

        TI_SNK_EW              : 372,
        TI_SNK_NS              : 373,
        TI_SNKT_S              : 374,
        TI_SNKT_W              : 375,
        TI_SNKT_N              : 376,
        TI_SNKT_E              : 377,

        TI_TARBABY_NW          : 378,
        TI_TARBABY_N           : 379,
        TI_TARBABY_NE          : 380,
        TI_TARBABY_W           : 381,
        TI_TARBABY_E           : 383,
        TI_TARBABY_SW          : 384,
        TI_TARBABY_S           : 385,
        TI_TARBABY_SE          : 386,
        TI_CITIZEN_NW          : 387,
        TI_CITIZEN_N           : 388,
        TI_CITIZEN_NE          : 389,
        TI_CITIZEN_W           : 390,
        TI_CITIZEN_E           : 392,
        TI_CITIZEN_SW          : 393,
        TI_CITIZEN_S           : 394,
        TI_CITIZEN_SE          : 395,

        TI_TARBABY_ANW          : 396,
        TI_TARBABY_AN           : 397,
        TI_TARBABY_ANE          : 398,
        TI_TARBABY_AW           : 399,
        TI_TARBABY_AE           : 401,
        TI_TARBABY_ASW          : 402,
        TI_TARBABY_AS           : 403,
        TI_TARBABY_ASE          : 404,
        TI_MUDCOORDINATOR_NW    : 405,
        TI_MUDCOORDINATOR_N     : 406,
        TI_MUDCOORDINATOR_NE    : 407,
        TI_MUDCOORDINATOR_W     : 408,
        TI_MUDCOORDINATOR_E     : 410,
        TI_MUDCOORDINATOR_SW    : 411,
        TI_MUDCOORDINATOR_S     : 412,
        TI_MUDCOORDINATOR_SE    : 413,

        TI_EEYEW_NW          : 414,
        TI_EEYEW_N           : 415,
        TI_EEYEW_NE          : 416,
        TI_EEYEW_W           : 417,
        TI_EEYEW_E           : 419,
        TI_EEYEW_SW          : 420,
        TI_EEYEW_S           : 421,
        TI_EEYEW_SE          : 422,
        TI_NEGOTIATOR_NW     : 423,
        TI_NEGOTIATOR_N      : 424,
        TI_NEGOTIATOR_NE     : 425,
        TI_NEGOTIATOR_W      : 426,
        TI_NEGOTIATOR_E      : 428,
        TI_NEGOTIATOR_SW     : 429,
        TI_NEGOTIATOR_S      : 430,
        TI_NEGOTIATOR_SE     : 431,

        TI_DECOY_SWORD_NW    : 432,
        TI_DECOY_SWORD_N     : 433,
        TI_DECOY_SWORD_NE    : 434,
        TI_DECOY_SWORD_W     : 435,
        TI_DECOY_SWORD_E     : 437,
        TI_DECOY_SWORD_SW    : 438,
        TI_DECOY_SWORD_S     : 439,
        TI_DECOY_SWORD_SE    : 440,
        TI_TARTECHNICIAN_NW  : 441,
        TI_TARTECHNICIAN_N   : 442,
        TI_TARTECHNICIAN_NE  : 443,
        TI_TARTECHNICIAN_W   : 444,
        TI_TARTECHNICIAN_E   : 446,
        TI_TARTECHNICIAN_SW  : 447,
        TI_TARTECHNICIAN_S   : 448,
        TI_TARTECHNICIAN_SE  : 449,

        TI_SHADOW_N   : 450,
        TI_SHADOW_1   : 451,
        TI_SHADOW_W   : 452,
        TI_SHADOW_N1  : 453,
        TI_SHADOW_W1  : 454,
        TI_SHADOW_NW1 : 455,
        TI_SHADOW_NW  : 456,

        TI_DECOY_NW : 459,
        TI_DECOY_N : 460,
        TI_DECOY_NE : 461,
        TI_DECOY_W : 462,
        TI_DECOY_E : 464,
        TI_DECOY_SW : 465,
        TI_DECOY_S : 466,
        TI_DECOY_SE : 467,


        // Wall tileset

        TI_OBST_1_2_11          : 0,
        TI_OBST_1_2_12          : 1,
        TI_OBST_2_2_11          : 2,
        TI_OBST_2_2_12          : 3,
        TI_OBST_3_2_11          : 4,
        TI_OBST_3_2_12          : 5,
        TI_OBST_4_2_11          : 6,
        TI_OBST_4_2_12          : 7,
        TI_OBST_7_2_11          : 8,
        TI_OBST_7_2_12          : 9,
        TI_OBST_8_2_11          : 10,
        TI_OBST_8_2_12          : 11,
        TI_OBST_3_1             : 12,
        TI_OBST_1_1             : 13,
        TI_OBST_7_1             : 14,
        TI_OBST_9_1             : 15,
        TI_OBST_9_2_11          : 16,
        TI_OBST_9_2_12          : 16,


        TI_OBST_1_2_21          : 18,
        TI_OBST_1_2_22          : 19,
        TI_OBST_2_2_21          : 20,
        TI_OBST_2_2_22          : 21,
        TI_OBST_3_2_21          : 22,
        TI_OBST_3_2_22          : 23,
        TI_OBST_4_2_21          : 24,
        TI_OBST_4_2_22          : 25,
        TI_OBST_7_2_21          : 26,
        TI_OBST_7_2_22          : 27,
        TI_OBST_8_2_21          : 28,
        TI_OBST_8_2_22          : 29,
        TI_OBST_4_1             : 30,
        TI_OBST_2_1             : 31,
        TI_OBST_8_1             : 32,
        TI_OBST_10_1            : 33,
        TI_OBST_9_2_21          : 34,
        TI_OBST_9_2_22          : 35,


        TI_WALL_SE4              : 36,
        TI_WALL_SE               : 37,
        TI_WALL_SW3              : 38,
        TI_WALL_SW               : 39,
        TI_WALL_NE2              : 40,
        TI_WALL_NE               : 41,
        TI_WALL_NW1              : 42,
        TI_WALL_NW               : 43,
        TI_WALL_S                : 44,
        TI_WALL_W                : 45,
        TI_WALL_N                : 46,
        TI_WALL_E                : 47,
        TI_WALL                  : 48,
        TI_WALL_EW               : 49,
        TI_WALL_NS               : 50,
        TI_OBST_10_2_11          : 52,
        TI_OBST_10_2_12          : 53,

        TI_WALL_SEW34            : 54,
        TI_WALL_SEW3             : 55,
        TI_WALL_SEW4             : 56,
        TI_WALL_SEW              : 57,
        TI_WALL_NEW12            : 58,
        TI_WALL_NEW2             : 59,
        TI_WALL_NEW1             : 60,
        TI_WALL_NEW              : 61,
        TI_WALL_NSE24            : 62,
        TI_WALL_NSE4             : 63,
        TI_WALL_NSE2             : 64,
        TI_WALL_NSE              : 65,
        TI_WALL_NSW13            : 66,
        TI_WALL_NSW3             : 67,
        TI_WALL_NSW1             : 68,
        TI_WALL_NSW              : 69,
        TI_OBST_10_2_21          : 70,
        TI_OBST_10_2_22          : 71,

        TI_WALL_NSEW1234         : 72,
        TI_WALL_NSEW234          : 73,
        TI_WALL_NSEW134          : 74,
        TI_WALL_NSEW34           : 75,
        TI_WALL_NSEW123          : 76,
        TI_WALL_NSEW23           : 77,
        TI_WALL_NSEW13           : 78,
        TI_WALL_NSEW3            : 79,
        TI_WALL_NSEW124          : 80,
        TI_WALL_NSEW24           : 81,
        TI_WALL_NSEW14           : 82,
        TI_WALL_NSEW4            : 83,
        TI_WALL_NSEW12           : 84,
        TI_WALL_NSEW2            : 85,
        TI_WALL_NSEW1            : 86,
        TI_WALL_NSEW             : 87,

        TI_WALLS_SE4              : 90,
        TI_WALLS_SE               : 91,
        TI_WALLS_SW3              : 92,
        TI_WALLS_SW               : 93,
        TI_WALLS_NE2              : 94,
        TI_WALLS_NE               : 95,
        TI_WALLS_NW1              : 96,
        TI_WALLS_NW               : 97,
        TI_WALLS_S                : 98,
        TI_WALLS_W                : 99,
        TI_WALLS_N                : 100,
        TI_WALLS_E                : 101,
        TI_WALLS                  : 102,
        TI_WALLS_EW               : 103,
        TI_WALLS_NS               : 104,

        TI_WALLS_SEW34            : 108,
        TI_WALLS_SEW3             : 109,
        TI_WALLS_SEW4             : 110,
        TI_WALLS_SEW              : 111,
        TI_WALLS_NEW12            : 112,
        TI_WALLS_NEW2             : 113,
        TI_WALLS_NEW1             : 114,
        TI_WALLS_NEW              : 115,
        TI_WALLS_NSE24            : 116,
        TI_WALLS_NSE4             : 117,
        TI_WALLS_NSE2             : 118,
        TI_WALLS_NSE              : 119,
        TI_WALLS_NSW13            : 120,
        TI_WALLS_NSW3             : 121,
        TI_WALLS_NSW1             : 122,
        TI_WALLS_NSW              : 123,

        TI_WALLS_NSEW1234         : 126,
        TI_WALLS_NSEW234          : 127,
        TI_WALLS_NSEW134          : 128,
        TI_WALLS_NSEW34           : 129,
        TI_WALLS_NSEW123          : 130,
        TI_WALLS_NSEW23           : 131,
        TI_WALLS_NSEW13           : 132,
        TI_WALLS_NSEW3            : 133,
        TI_WALLS_NSEW124          : 134,
        TI_WALLS_NSEW24           : 135,
        TI_WALLS_NSEW14           : 136,
        TI_WALLS_NSEW4            : 137,
        TI_WALLS_NSEW12           : 138,
        TI_WALLS_NSEW2            : 139,
        TI_WALLS_NSEW1            : 140,
        TI_WALLS_NSEW             : 141,

        TI_WALLB_SE4              : 144,
        TI_WALLB_SE               : 145,
        TI_WALLB_SW3              : 146,
        TI_WALLB_SW               : 147,
        TI_WALLB_NE2              : 148,
        TI_WALLB_NE               : 149,
        TI_WALLB_NW1              : 150,
        TI_WALLB_NW               : 151,
        TI_WALLB_S                : 152,
        TI_WALLB_W                : 153,
        TI_WALLB_N                : 154,
        TI_WALLB_E                : 155,
        TI_WALLB                  : 156,
        TI_WALLB_EW               : 157,
        TI_WALLB_NS               : 158,

        TI_WALLB_SEW34            : 162,
        TI_WALLB_SEW3             : 163,
        TI_WALLB_SEW4             : 164,
        TI_WALLB_SEW              : 165,
        TI_WALLB_NEW12            : 166,
        TI_WALLB_NEW2             : 167,
        TI_WALLB_NEW1             : 168,
        TI_WALLB_NEW              : 169,
        TI_WALLB_NSE24            : 170,
        TI_WALLB_NSE4             : 171,
        TI_WALLB_NSE2             : 172,
        TI_WALLB_NSE              : 173,
        TI_WALLB_NSW13            : 174,
        TI_WALLB_NSW3             : 175,
        TI_WALLB_NSW1             : 176,
        TI_WALLB_NSW              : 177,

        TI_WALLB_NSEW1234         : 180,
        TI_WALLB_NSEW234          : 181,
        TI_WALLB_NSEW134          : 182,
        TI_WALLB_NSEW34           : 183,
        TI_WALLB_NSEW123          : 184,
        TI_WALLB_NSEW23           : 185,
        TI_WALLB_NSEW13           : 186,
        TI_WALLB_NSEW3            : 187,
        TI_WALLB_NSEW124          : 188,
        TI_WALLB_NSEW24           : 189,
        TI_WALLB_NSEW14           : 190,
        TI_WALLB_NSEW4            : 191,
        TI_WALLB_NSEW12           : 192,
        TI_WALLB_NSEW2            : 193,
        TI_WALLB_NSEW1            : 194,
        TI_WALLB_NSEW             : 195,

        TI_STAIRS_1             : 198,
        TI_STAIRS_2             : 199,
        TI_STAIRS_3             : 200,
        TI_STAIRS_4             : 201,
        TI_STAIRS_5             : 202,

        TI_STAIRS_UP_1             : 203,
        TI_STAIRS_UP_2             : 204,
        TI_STAIRS_UP_3             : 205,

        TI_TRAPDOOR           : 206,
        TI_ARROW_N            : 207,
        TI_ARROW_NE           : 208,
        TI_ARROW_E            : 209,
        TI_ARROW_SE           : 210,
        TI_ARROW_S            : 211,
        TI_ARROW_SW           : 212,
        TI_ARROW_W            : 213,
        TI_ARROW_NW           : 214,

        WALL_SECRET_OFFSET    : 54,
        WALL_BROKEN_OFFSET    : 108,

        ROACH : [[0]],
        RQUEEN : [[0]],
        GOBLIN : [[0]],
        WWING:[[0]],
        EEYE : [[0]],
        SPIDER : [[0]],
        TARBABY : [[0]],
        REGG : [[0]],
        BEETHRO : [0],
        DECOY : [0],
        DECOY_SWORD : [0],
        SWORD : [0],
        MIMIC : [0],
        BRAIN : [0],
        CITIZEN : [0],
        NEGOTIATOR : [0],
        TARTECHNICIAN : [0],
        MUDCOORDINATOR : [0],
        SERPENT : [[0]],

        MIMIC_SWORD : [0],

        DOOR_Y : [0],

        DOOR_YO : [0],

        DOOR_R : [0],

        DOOR_RO : [0],

        DOOR_C : [0],

        DOOR_CO : [0],

        DOOR_B : [0],

        DOOR_BO : [0],

        DOOR_G : [0],

        DOOR_GO : [0],

        OBSTACLE_MAX_SIZE : 5,
        OBSTACLE_TOP      : 0x80,
        OBSTACLE_LEFT     : 0x40,

        OBSTACLE_INDICES : [[0]],

        OBSTACLE_DIMENSIONS : [[0]],

        OBSTACLE_TILES : [[[0]]],


        STYLE_ABOVEGROUND : "Aboveground" as StyleName,
        STYLE_CITY        : "City" as StyleName,
        STYLE_DEEP_SPACES : "Deep Spaces" as StyleName,
        STYLE_FORTRESS    : "Fortress" as StyleName,
        STYLE_FOUNDATION  : "Foundation" as StyleName,
        STYLE_ICEWORKS    : "Iceworks" as StyleName,

        TILES_WALL          : 0 as StyleTilesets,
        TILES_FLOOR         : 1 as StyleTilesets,
        TILES_FLOOR_ALT     : 2 as StyleTilesets,
        TILES_FLOOR_DIRT    : 3 as StyleTilesets,
        TILES_FLOOR_GRASS   : 4 as StyleTilesets,
        TILES_FLOOR_MOSAIC  : 5 as StyleTilesets,
        TILES_FLOOR_ROAD    : 6 as StyleTilesets,
        TILES_PIT           : 7 as StyleTilesets,
        TILES_PIT_SIDE       : 8 as StyleTilesets,
        TILES_PIT_SIDE_SMALL : 9 as StyleTilesets,
        TILES_STYLE         : 10 as StyleTilesets,

        plotPrecise(bitmapData:BitmapDataWritable, tile:number, x:number, y:number, source?:CanvasImageSource){
            UtilsBitmapData.blitPart(source || Gfx.GENERAL_TILES, bitmapData, x, y,
                F.tileToX(tile), F.tileToY(tile),
                S.RoomTileWidth, S.RoomTileHeight);
        }
    }



    T.ROACH = [
	    [
		    T.TI_ROACH_NW, T.TI_ROACH_N, T.TI_ROACH_NE,
		    T.TI_ROACH_W,  0,          T.TI_ROACH_E,
		    T.TI_ROACH_SW, T.TI_ROACH_S, T.TI_ROACH_SE
	    ],
	    [
		    T.TI_ROACH_ANW, T.TI_ROACH_AN, T.TI_ROACH_ANE,
		    T.TI_ROACH_AW,  0,           T.TI_ROACH_AE,
		    T.TI_ROACH_ASW, T.TI_ROACH_AS, T.TI_ROACH_ASE
	    ]
    ];

    T.RQUEEN = [
	    [
		    T.TI_RQUEEN_NW, T.TI_RQUEEN_N, T.TI_RQUEEN_NE,
		    T.TI_RQUEEN_W,  0,           T.TI_RQUEEN_E,
		    T.TI_RQUEEN_SW, T.TI_RQUEEN_S, T.TI_RQUEEN_SE
	    ],
	    [
		    T.TI_RQUEEN_ANW, T.TI_RQUEEN_AN, T.TI_RQUEEN_ANE,
		    T.TI_RQUEEN_AW,  0,            T.TI_RQUEEN_AE,
		    T.TI_RQUEEN_ASW, T.TI_RQUEEN_AS, T.TI_RQUEEN_ASE
	    ]
    ];

T.GOBLIN = [
	    [
		    T.TI_GOBLIN_NW, T.TI_GOBLIN_N, T.TI_GOBLIN_NE,
		    T.TI_GOBLIN_W,  0,           T.TI_GOBLIN_E,
		    T.TI_GOBLIN_SW, T.TI_GOBLIN_S, T.TI_GOBLIN_SE
	    ],
	    [
		    T.TI_GOBLIN_ANW, T.TI_GOBLIN_AN, T.TI_GOBLIN_ANE,
		    T.TI_GOBLIN_AW,  0,            T.TI_GOBLIN_AE,
		    T.TI_GOBLIN_ASW, T.TI_GOBLIN_AS, T.TI_GOBLIN_ASE
	    ]
    ];

T.WWING = [
	    [
		    T.TI_WWING_NW, T.TI_WWING_N, T.TI_WWING_NE,
		    T.TI_WWING_W,  0,          T.TI_WWING_E,
		    T.TI_WWING_SW, T.TI_WWING_S, T.TI_WWING_SE
	    ],
	    [
		    T.TI_WWING_ANW, T.TI_WWING_AN, T.TI_WWING_ANE,
		    T.TI_WWING_AW,  0,           T.TI_WWING_AE,
		    T.TI_WWING_ASW, T.TI_WWING_AS, T.TI_WWING_ASE
	    ]
    ];

T.EEYE = [
	    [
		    T.TI_EEYE_NW, T.TI_EEYE_N, T.TI_EEYE_NE,
		    T.TI_EEYE_W,  0,         T.TI_EEYE_E,
		    T.TI_EEYE_SW, T.TI_EEYE_S, T.TI_EEYE_SE
	    ],
	    [
		    T.TI_EEYE_ANW, T.TI_EEYE_AN, T.TI_EEYE_ANE,
		    T.TI_EEYE_AW,  0,          T.TI_EEYE_AE,
		    T.TI_EEYE_ASW, T.TI_EEYE_AS, T.TI_EEYE_ASE
	    ],
	    [
		    T.TI_EEYEW_NW, T.TI_EEYEW_N, T.TI_EEYEW_NE,
		    T.TI_EEYEW_W,  0,          T.TI_EEYEW_E,
		    T.TI_EEYEW_SW, T.TI_EEYEW_S, T.TI_EEYEW_SE
	    ]
    ];

T.SPIDER = [
	    [
		    T.TI_SPIDER_NW, T.TI_SPIDER_N, T.TI_SPIDER_NE,
		    T.TI_SPIDER_W,  0,           T.TI_SPIDER_E,
		    T.TI_SPIDER_SW, T.TI_SPIDER_S, T.TI_SPIDER_SE
	    ],
	    [
		    T.TI_SPIDER_ANW, T.TI_SPIDER_AN, T.TI_SPIDER_ANE,
		    T.TI_SPIDER_AW,  0,            T.TI_SPIDER_AE,
		    T.TI_SPIDER_ASW, T.TI_SPIDER_AS, T.TI_SPIDER_ASE
	    ]
    ];

T.TARBABY = [
	    [
		    T.TI_TARBABY_NW, T.TI_TARBABY_N, T.TI_TARBABY_NE,
		    T.TI_TARBABY_W,  0,            T.TI_TARBABY_E,
		    T.TI_TARBABY_SW, T.TI_TARBABY_S, T.TI_TARBABY_SE
	    ],
	    [
		    T.TI_TARBABY_ANW, T.TI_TARBABY_AN, T.TI_TARBABY_ANE,
		    T.TI_TARBABY_AW,  0,             T.TI_TARBABY_AE,
		    T.TI_TARBABY_ASW, T.TI_TARBABY_AS, T.TI_TARBABY_ASE
	    ]
    ];

T.REGG = [
	    [
		    T.TI_REGG_NW, T.TI_REGG_N, 0,
		    T.TI_REGG_W,  0,         0,
		    T.TI_REGG_SW, 0,         0
	    ],
	    [
		    T.TI_REGG_ANW, T.TI_REGG_AN, 0,
		    T.TI_REGG_AW,  0,          0,
		    T.TI_REGG_ASW, 0,          0
	    ]
    ];

T.BEETHRO = [
	    T.TI_BEETHRO_NW, T.TI_BEETHRO_N, T.TI_BEETHRO_NE,
	    T.TI_BEETHRO_W,  0,            T.TI_BEETHRO_E,
	    T.TI_BEETHRO_SW, T.TI_BEETHRO_S, T.TI_BEETHRO_SE
    ];

T.DECOY = [
	    T.TI_DECOY_NW, T.TI_DECOY_N, T.TI_DECOY_NE,
	    T.TI_DECOY_W,  0,          T.TI_DECOY_E,
	    T.TI_DECOY_SW, T.TI_DECOY_S, T.TI_DECOY_SE
    ];

T.DECOY_SWORD = [
	    T.TI_DECOY_SWORD_NW, T.TI_DECOY_SWORD_N, T.TI_DECOY_SWORD_NE,
	    T.TI_DECOY_SWORD_W,  0,          T.TI_DECOY_SWORD_E,
	    T.TI_DECOY_SWORD_SW, T.TI_DECOY_SWORD_S, T.TI_DECOY_SWORD_SE
    ];



T.SWORD = [
	    T.TI_BEETHRO_SWORD_NW, T.TI_BEETHRO_SWORD_N, T.TI_BEETHRO_SWORD_NE,
	    T.TI_BEETHRO_SWORD_W,  0,                  T.TI_BEETHRO_SWORD_E,
	    T.TI_BEETHRO_SWORD_SW, T.TI_BEETHRO_SWORD_S, T.TI_BEETHRO_SWORD_SE
    ];

T.MIMIC = [
	    T.TI_MIMIC_NW, T.TI_MIMIC_N, T.TI_MIMIC_NE,
	    T.TI_MIMIC_W,  0,          T.TI_MIMIC_E,
	    T.TI_MIMIC_SW, T.TI_MIMIC_S, T.TI_MIMIC_SE
    ];

T.BRAIN = [
	    T.TI_BRAIN, T.TI_BRAIN_A
    ];

T.CITIZEN = [
	    T.TI_CITIZEN_NW, T.TI_CITIZEN_N, T.TI_CITIZEN_NE,
	    T.TI_CITIZEN_W,  0,          T.TI_CITIZEN_E,
	    T.TI_CITIZEN_SW, T.TI_CITIZEN_S, T.TI_CITIZEN_SE
    ];

T.NEGOTIATOR = [
	    T.TI_NEGOTIATOR_NW, T.TI_NEGOTIATOR_N, T.TI_NEGOTIATOR_NE,
	    T.TI_NEGOTIATOR_W,  0,          T.TI_NEGOTIATOR_E,
	    T.TI_NEGOTIATOR_SW, T.TI_NEGOTIATOR_S, T.TI_NEGOTIATOR_SE
    ];

T.TARTECHNICIAN = [
	    T.TI_TARTECHNICIAN_NW, T.TI_TARTECHNICIAN_N, T.TI_TARTECHNICIAN_NE,
	    T.TI_TARTECHNICIAN_W,  0,          T.TI_TARTECHNICIAN_E,
	    T.TI_TARTECHNICIAN_SW, T.TI_TARTECHNICIAN_S, T.TI_TARTECHNICIAN_SE
    ];

T.MUDCOORDINATOR = [
	    T.TI_MUDCOORDINATOR_NW, T.TI_MUDCOORDINATOR_N, T.TI_MUDCOORDINATOR_NE,
	    T.TI_MUDCOORDINATOR_W,  0,          T.TI_MUDCOORDINATOR_E,
	    T.TI_MUDCOORDINATOR_SW, T.TI_MUDCOORDINATOR_S, T.TI_MUDCOORDINATOR_SE
    ];

T.SERPENT = [
	    [
		    0,         T.TI_SNKH_N, 0,
		    T.TI_SNKH_W, 0,         T.TI_SNKH_E,
		    0,         T.TI_SNKH_S, 0
	    ],
	    [
		    0,          T.TI_SNKH_AN, 0,
		    T.TI_SNKH_AW, 0,          T.TI_SNKH_AE,
		    0,          T.TI_SNKH_AS, 0
	    ],
    ];






T.MIMIC_SWORD = [
	    T.TI_MIMIC_SWORD_NW, T.TI_MIMIC_SWORD_N, T.TI_MIMIC_SWORD_NE,
	    T.TI_MIMIC_SWORD_W,  0,                T.TI_MIMIC_SWORD_E,
	    T.TI_MIMIC_SWORD_SW, T.TI_MIMIC_SWORD_S, T.TI_MIMIC_SWORD_SE
    ];

T.DOOR_Y = [
	    T.TI_DOOR_Y,    T.TI_DOOR_Y_W,   T.TI_DOOR_Y_S,   T.TI_DOOR_Y_SW,
	    T.TI_DOOR_Y_E,  T.TI_DOOR_Y_EW,  T.TI_DOOR_Y_SE,  T.TI_DOOR_Y_SEW,
	    T.TI_DOOR_Y_N,  T.TI_DOOR_Y_NW,  T.TI_DOOR_Y_NS,  T.TI_DOOR_Y_NSW,
	    T.TI_DOOR_Y_NE, T.TI_DOOR_Y_NEW, T.TI_DOOR_Y_NSE, T.TI_DOOR_Y_NSEW
    ];

T.DOOR_YO = [
	    T.TI_DOOR_YO,    T.TI_DOOR_YO_W,   T.TI_DOOR_YO_S,   T.TI_DOOR_YO_SW,
	    T.TI_DOOR_YO_E,  T.TI_DOOR_YO_EW,  T.TI_DOOR_YO_SE,  T.TI_DOOR_YO_SEW,
	    T.TI_DOOR_YO_N,  T.TI_DOOR_YO_NW,  T.TI_DOOR_YO_NS,  T.TI_DOOR_YO_NSW,
	    T.TI_DOOR_YO_NE, T.TI_DOOR_YO_NEW, T.TI_DOOR_YO_NSE, T.TI_DOOR_YO_NSEW
    ];

T.DOOR_R = [
	    T.TI_DOOR_R,    T.TI_DOOR_R_W,   T.TI_DOOR_R_S,   T.TI_DOOR_R_SW,
	    T.TI_DOOR_R_E,  T.TI_DOOR_R_EW,  T.TI_DOOR_R_SE,  T.TI_DOOR_R_SEW,
	    T.TI_DOOR_R_N,  T.TI_DOOR_R_NW,  T.TI_DOOR_R_NS,  T.TI_DOOR_R_NSW,
	    T.TI_DOOR_R_NE, T.TI_DOOR_R_NEW, T.TI_DOOR_R_NSE, T.TI_DOOR_R_NSEW
    ];

T.DOOR_RO = [
	    T.TI_DOOR_RO,    T.TI_DOOR_RO_W,   T.TI_DOOR_RO_S,   T.TI_DOOR_RO_SW,
	    T.TI_DOOR_RO_E,  T.TI_DOOR_RO_EW,  T.TI_DOOR_RO_SE,  T.TI_DOOR_RO_SEW,
	    T.TI_DOOR_RO_N,  T.TI_DOOR_RO_NW,  T.TI_DOOR_RO_NS,  T.TI_DOOR_RO_NSW,
	    T.TI_DOOR_RO_NE, T.TI_DOOR_RO_NEW, T.TI_DOOR_RO_NSE, T.TI_DOOR_RO_NSEW
    ];

T.DOOR_C = [
	    T.TI_DOOR_C,    T.TI_DOOR_C_W,   T.TI_DOOR_C_S,   T.TI_DOOR_C_SW,
	    T.TI_DOOR_C_E,  T.TI_DOOR_C_EW,  T.TI_DOOR_C_SE,  T.TI_DOOR_C_SEW,
	    T.TI_DOOR_C_N,  T.TI_DOOR_C_NW,  T.TI_DOOR_C_NS,  T.TI_DOOR_C_NSW,
	    T.TI_DOOR_C_NE, T.TI_DOOR_C_NEW, T.TI_DOOR_C_NSE, T.TI_DOOR_C_NSEW
    ];

T.DOOR_CO = [
	    T.TI_DOOR_CO,    T.TI_DOOR_CO_W,   T.TI_DOOR_CO_S,   T.TI_DOOR_CO_SW,
	    T.TI_DOOR_CO_E,  T.TI_DOOR_CO_EW,  T.TI_DOOR_CO_SE,  T.TI_DOOR_CO_SEW,
	    T.TI_DOOR_CO_N,  T.TI_DOOR_CO_NW,  T.TI_DOOR_CO_NS,  T.TI_DOOR_CO_NSW,
	    T.TI_DOOR_CO_NE, T.TI_DOOR_CO_NEW, T.TI_DOOR_CO_NSE, T.TI_DOOR_CO_NSEW
    ];

T.DOOR_B = [
	    T.TI_DOOR_B,    T.TI_DOOR_B_W,   T.TI_DOOR_B_S,   T.TI_DOOR_B_SW,
	    T.TI_DOOR_B_E,  T.TI_DOOR_B_EW,  T.TI_DOOR_B_SE,  T.TI_DOOR_B_SEW,
	    T.TI_DOOR_B_N,  T.TI_DOOR_B_NW,  T.TI_DOOR_B_NS,  T.TI_DOOR_B_NSW,
	    T.TI_DOOR_B_NE, T.TI_DOOR_B_NEW, T.TI_DOOR_B_NSE, T.TI_DOOR_B_NSEW
    ];

T.DOOR_BO = [
	    T.TI_DOOR_BO,    T.TI_DOOR_BO_W,   T.TI_DOOR_BO_S,   T.TI_DOOR_BO_SW,
	    T.TI_DOOR_BO_E,  T.TI_DOOR_BO_EW,  T.TI_DOOR_BO_SE,  T.TI_DOOR_BO_SEW,
	    T.TI_DOOR_BO_N,  T.TI_DOOR_BO_NW,  T.TI_DOOR_BO_NS,  T.TI_DOOR_BO_NSW,
	    T.TI_DOOR_BO_NE, T.TI_DOOR_BO_NEW, T.TI_DOOR_BO_NSE, T.TI_DOOR_BO_NSEW
    ];

T.DOOR_G = [
	    T.TI_DOOR_G,    T.TI_DOOR_G_W,   T.TI_DOOR_G_S,   T.TI_DOOR_G_SW,
	    T.TI_DOOR_G_E,  T.TI_DOOR_G_EW,  T.TI_DOOR_G_SE,  T.TI_DOOR_G_SEW,
	    T.TI_DOOR_G_N,  T.TI_DOOR_G_NW,  T.TI_DOOR_G_NS,  T.TI_DOOR_G_NSW,
	    T.TI_DOOR_G_NE, T.TI_DOOR_G_NEW, T.TI_DOOR_G_NSE, T.TI_DOOR_G_NSEW
    ];

T.DOOR_GO = [
	    T.TI_DOOR_GO,    T.TI_DOOR_GO_W,   T.TI_DOOR_GO_S,   T.TI_DOOR_GO_SW,
	    T.TI_DOOR_GO_E,  T.TI_DOOR_GO_EW,  T.TI_DOOR_GO_SE,  T.TI_DOOR_GO_SEW,
	    T.TI_DOOR_GO_N,  T.TI_DOOR_GO_NW,  T.TI_DOOR_GO_NS,  T.TI_DOOR_GO_NSW,
	    T.TI_DOOR_GO_NE, T.TI_DOOR_GO_NEW, T.TI_DOOR_GO_NSE, T.TI_DOOR_GO_NSEW
    ];

T.OBSTACLE_INDICES = [
	    [0],  //0th index signifies an invalid obstacle type
	    [1, 2, 3],     //boulder
	    [4, 5, 6],
	    [7, 8],        //fern
	    [9, 10],
	    [11, 12, 13],  //building
	    [14, 15, 16],
	    [17, 18],      //skulls
	    [19, 20],
	    [21, 22, 23],  //Goblin statue
	    [24, 25, 26],  //Empire statue
	    [27, 28],      //desk
	    [29, 30],      //bookshelf
	    [31],          //chairs
	    [32],
	    [33],
	    [34],
	    [35],          //book pedestal
	    [36],          //chest
	    [37],          //graves
	    [38],
	    [39],          //crate
	    [40, 41, 42],  //table
	    [43, 44],      //table w/ runner
	    [45, 46],      //clockweight
	    [47, 48],      //hut
	    [49, 50],      //cauldron
	    [51, 52],      //bed
	    [53],          //sign post
	    [54],          //barrel
	    [55, 59],      //pipe
	    [56, 57],      //couches
	    [58]           //sink
    ];

T.OBSTACLE_DIMENSIONS = [
	    [0],
	    [1,1],[2,2],[3,3],  //boulder
	    [1,1],[2,2],[3,3],
	    [1,1],[2,2],        //fern
	    [1,1],[2,2],
	    [1,1],[3,3],[5,5],  //building
	    [1,1],[3,3],[5,5],
	    [1,1],[2,2],        //skulls
	    [1,1],[2,2],
	    [1,1],[2,2],[4,4],  //Goblin statue
	    [1,1],[2,2],[4,4],  //Empire statue
	    [1,1],[3,3],        //desk
	    [1,1],[2,1],        //bookshelf
	    [1,1],              //chairs
	    [1,1],
	    [1,1],
	    [1,1],
	    [1,1],              //book pedestal
	    [1,1],              //chest
	    [1,1],              //graves
	    [1,1],
	    [1,1],              //crate
	    [1,1],[2,2],[3,3],  //table
	    [1,1],[2,2],        //table w/ runner
	    [1,1],[4,4],        //clockweight
	    [1,1],[3,3],        //hut
	    [1,1],[2,2],        //cauldron
	    [1,1],[1,2],        //bed
	    [1,1],              //sign post
	    [1,1],              //barrel
	    [1,1],              //pipe
	    [1,1],[2,1],        //couches
	    [1,1],              //sink
	    [3,1]               //pipe (3x1)
    ];

T.OBSTACLE_TILES = [
	    [],

	    [[T.TI_OBST_1_1]], // Boulder 1
	    [[T.TI_OBST_1_2_11, T.TI_OBST_1_2_12], [T.TI_OBST_1_2_21, T.TI_OBST_1_2_22]],
	    [],

	    [[T.TI_OBST_2_1]], // Boulder 2
	    [[T.TI_OBST_2_2_11, T.TI_OBST_2_2_12], [T.TI_OBST_2_2_21, T.TI_OBST_2_2_22]],
	    [],

	    [[T.TI_OBST_3_1]], // Fern 1
	    [[T.TI_OBST_3_2_11, T.TI_OBST_3_2_12],[T.TI_OBST_3_2_21, T.TI_OBST_3_2_22]],

	    [[T.TI_OBST_4_1]], // Fern 2
	    [[T.TI_OBST_4_2_11, T.TI_OBST_4_2_12],[T.TI_OBST_4_2_21, T.TI_OBST_4_2_22]],

	    [],[],[], [], [], [], // Buildings

	    [[T.TI_OBST_7_1]], // Skulls 1
	    [[T.TI_OBST_7_2_11, T.TI_OBST_7_2_12],[T.TI_OBST_7_2_21, T.TI_OBST_7_2_22]],

	    [[T.TI_OBST_8_1]], // Skulls 2
	    [[T.TI_OBST_8_2_11, T.TI_OBST_8_2_12],[T.TI_OBST_8_2_21, T.TI_OBST_8_2_22]],

	    [[T.TI_OBST_10_1]], // Statues 1
	    [[T.TI_OBST_10_2_11, T.TI_OBST_10_2_12], [T.TI_OBST_10_2_21, T.TI_OBST_10_2_22]],
	    [],

	    [[T.TI_OBST_10_1]], // Statues 2
	    [[T.TI_OBST_10_2_11, T.TI_OBST_10_2_12], [T.TI_OBST_10_2_21, T.TI_OBST_10_2_22]],
	    []
    ];


for (let i = 0; i < 720; i++){
	T.TILES[i] = new PIXI.Rectangle(
		(i % 18) * (S.RoomTileWidth + 2) + 1,
		(i / 18 | 0) * (S.RoomTileHeight + 2) + 1,
		S.RoomTileWidth,
		S.RoomTileHeight
    );
}