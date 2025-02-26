import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Language } from '@/src/modules/genres/enums/language.enum';

type ArtworkTranslation = {
  title: string;
  shortReview: string;
};

type ArtworkSeed = {
  translations: {
    [key in Language]: ArtworkTranslation;
  };
  genres: string[];
  playedOn: Platform;
  rating: number;
  isDraft: boolean;
  createdAt: string;
  imageKey?: string;
  isVertical?: boolean;
};

// NOTE: 어디까지나 시드 데이터이므로, 리뷰나 평점 등의 내용은 실제 내 의견과 다름!!!
export const ARTWORKS: ArtworkSeed[] = [
  {
    translations: {
      [Language.KO]: {
        title: '엘든 링',
        shortReview:
          '프롬 소프트웨어의 걸작. 광활한 오픈월드와 도전적인 전투가 조화를 이룹니다.',
      },
      [Language.EN]: {
        title: 'Elden Ring',
        shortReview:
          "FromSoftware's masterpiece. A harmony of vast open world and challenging combat.",
      },
      [Language.JA]: {
        title: 'エルデンリング',
        shortReview:
          'フロム・ソフトウェアの傑作。広大なオープンワールドと挑戦的な戦闘が調和しています。',
      },
    },
    genres: ['Action', 'RPG'],
    playedOn: Platform.STEAM,
    rating: 20,
    isDraft: false,
    createdAt: '2024-02-01',
    imageKey: 'temp/h1.webp',
  },
  {
    translations: {
      [Language.KO]: {
        title: '젤다의 전설: 티어스 오브 더 킹덤',
        shortReview:
          '전작의 완성도를 한 단계 더 끌어올린 오픈월드의 새로운 기준.',
      },
      [Language.EN]: {
        title: 'The Legend of Zelda: Tears of the Kingdom',
        shortReview:
          'A new standard for open-world games, elevating the quality of its predecessor.',
      },
      [Language.JA]: {
        title: 'ゼルダの伝説 ティアーズ オブ ザ キングダム',
        shortReview: '前作の完成度をさらに高めた、オープンワールドの新基準。',
      },
    },
    genres: ['Action', 'Adventure'],
    playedOn: Platform.SWITCH,
    rating: 20,
    isDraft: false,
    createdAt: '2024-01-30',
    imageKey: 'temp/v2.webp',
    isVertical: true,
  },
  {
    translations: {
      [Language.KO]: {
        title: '발더스 게이트 3',
        shortReview:
          'CRPG의 현대화를 완벽하게 해낸 수작. 선택의 자유도가 인상적입니다.',
      },
      [Language.EN]: {
        title: "Baldur's Gate 3",
        shortReview:
          'A masterpiece that perfectly modernizes CRPG. The freedom of choice is impressive.',
      },
      [Language.JA]: {
        title: 'バルダーズ・ゲート3',
        shortReview: 'CRPGを完璧に現代化した傑作。選択の自由度が印象的です。',
      },
    },
    genres: ['RPG', 'Strategy'],
    playedOn: Platform.STEAM,
    rating: 20,
    isDraft: false,
    createdAt: '2024-01-28',
    imageKey: 'temp/h2.webp',
  },
  {
    translations: {
      [Language.KO]: {
        title: '페르소나 3 리로드',
        shortReview:
          '클래식 JRPG의 현대적 리메이크. 페르소나 시리즈의 진수를 보여줍니다.',
      },
      [Language.EN]: {
        title: 'Persona 3 Reload',
        shortReview:
          'A modern remake of a classic JRPG. Shows the essence of the Persona series.',
      },
      [Language.JA]: {
        title: 'ペルソナ3 リロード',
        shortReview:
          '古典的なJRPGの現代的リメイク。ペルソナシリーズの真髄を見せています。',
      },
    },
    genres: ['RPG', 'Simulation'],
    playedOn: Platform.STEAM,
    rating: 19,
    isDraft: false,
    createdAt: '2024-01-25',
    imageKey: 'temp/v1.webp',
    isVertical: true,
  },
  {
    translations: {
      [Language.KO]: {
        title: '파이널 판타지 7 리버스',
        shortReview:
          '액션성이 강화된 리메이크. 원작의 감동을 새롭게 재해석했습니다.',
      },
      [Language.EN]: {
        title: 'Final Fantasy VII Rebirth',
        shortReview:
          "A remake with enhanced action. Reinterprets the original's emotional impact.",
      },
      [Language.JA]: {
        title: 'ファイナルファンタジーVII リバース',
        shortReview:
          'アクション性が強化されたリメイク。原作の感動を新しく解釈しました。',
      },
    },
    genres: ['RPG', 'Action'],
    playedOn: Platform.STEAM,
    rating: 19,
    isDraft: false,
    createdAt: '2024-01-22',
  },
  {
    translations: {
      [Language.KO]: {
        title: '데빌 메이 크라이 5',
        shortReview:
          '스타일리시한 액션의 끝판왕. 다양한 캐릭터와 전투 스타일이 매력적입니다.',
      },
      [Language.EN]: {
        title: 'Devil May Cry 5',
        shortReview:
          'The pinnacle of stylish action. Attractive with various characters and combat styles.',
      },
      [Language.JA]: {
        title: 'デビル メイ クライ 5',
        shortReview:
          'スタイリッシュアクションの極み。多様なキャラクターと戦闘スタイルが魅力的です。',
      },
    },
    genres: ['Action'],
    playedOn: Platform.STEAM,
    rating: 18,
    isDraft: false,
    createdAt: '2024-01-20',
  },
  {
    translations: {
      [Language.KO]: {
        title: '슈퍼 마리오 원더',
        shortReview: '마리오의 2D 플랫포머가 보여줄 수 있는 최고의 모습입니다.',
      },
      [Language.EN]: {
        title: 'Super Mario Wonder',
        shortReview:
          "The best representation of what Mario's 2D platformer can show.",
      },
      [Language.JA]: {
        title: 'スーパーマリオワンダー',
        shortReview: 'マリオの2Dプラットフォーマーが見せられる最高の姿です。',
      },
    },
    genres: ['Action', 'Platformer'],
    playedOn: Platform.SWITCH,
    rating: 18,
    isDraft: false,
    createdAt: '2024-01-18',
  },
  {
    translations: {
      [Language.KO]: {
        title: '모던워페어 3',
        shortReview: '완성도 높은 멀티플레이어와 화려한 캠페인이 돋보입니다.',
      },
      [Language.EN]: {
        title: 'Modern Warfare 3',
        shortReview:
          'Features a polished multiplayer and spectacular campaign.',
      },
      [Language.JA]: {
        title: 'モダン・ウォーフェア 3',
        shortReview:
          '完成度の高いマルチプレイヤーと華麗なキャンペーンが際立ちます。',
      },
    },
    genres: ['Action', 'Shooting'],
    playedOn: Platform.STEAM,
    rating: 17,
    isDraft: false,
    createdAt: '2024-01-15',
  },
  {
    translations: {
      [Language.KO]: {
        title: '라이크 어 드래곤: 가이덴',
        shortReview: '야쿠자 시리즈의 매력을 고스란히 담아낸 스핀오프.',
      },
      [Language.EN]: {
        title: 'Like a Dragon Gaiden',
        shortReview:
          'A spin-off that perfectly captures the charm of the Yakuza series.',
      },
      [Language.JA]: {
        title: 'Like a Dragon Gaiden 如くシリーズ',
        shortReview: '龍が如くシリーズの魅力をそのまま詰め込んだスピンオフ。',
      },
    },
    genres: ['Action', 'Adventure'],
    playedOn: Platform.STEAM,
    rating: 17,
    isDraft: false,
    createdAt: '2024-01-12',
  },
  {
    translations: {
      [Language.KO]: {
        title: '스파이더맨 2',
        shortReview: '더욱 화려해진 웹슬링과 전투, 볼거리 가득한 뉴욕 도시.',
      },
      [Language.EN]: {
        title: "Marvel's Spider-Man 2",
        shortReview:
          'Enhanced web-slinging and combat, with a New York City full of spectacles.',
      },
      [Language.JA]: {
        title: 'スパイダーマン2',
        shortReview:
          'さらに華麗になったウェブスリングとバトル、見どころ満載のニューヨーク。',
      },
    },
    genres: ['Action', 'Adventure'],
    playedOn: Platform.STEAM,
    rating: 16,
    isDraft: false,
    createdAt: '2024-01-10',
  },
  {
    translations: {
      [Language.KO]: {
        title: '스타필드',
        shortReview:
          '우주 탐험은 흥미롭지만 약간의 아쉬움이 남는 베데스다의 신작.',
      },
      [Language.EN]: {
        title: 'Starfield',
        shortReview:
          "Bethesda's new title with interesting space exploration but some disappointments.",
      },
      [Language.JA]: {
        title: 'スターフィールド',
        shortReview:
          '宇宙探検は興味深いものの、若干の物足りなさが残るベセスダの新作。',
      },
    },
    genres: ['RPG', 'Adventure', 'Simulation'],
    playedOn: Platform.STEAM,
    rating: 15,
    isDraft: false,
    createdAt: '2024-01-08',
  },
  {
    translations: {
      [Language.KO]: {
        title: '포르자 호라이즌 5',
        shortReview: '아름다운 그래픽과 주행 물리엔진이 인상적인 레이싱 게임.',
      },
      [Language.EN]: {
        title: 'Forza Horizon 5',
        shortReview:
          'A racing game with impressive graphics and driving physics.',
      },
      [Language.JA]: {
        title: 'Forza Horizon 5',
        shortReview:
          '美しいグラフィックと走行物理エンジンが印象的なレースゲーム。',
      },
    },
    genres: ['Racing', 'Sports'],
    playedOn: Platform.STEAM,
    rating: 14,
    isDraft: false,
    createdAt: '2024-01-05',
  },
  {
    translations: {
      [Language.KO]: {
        title: 'NBA 2K24',
        shortReview: '여전히 최고의 농구 게임이지만 과금 요소가 아쉽습니다.',
      },
      [Language.EN]: {
        title: 'NBA 2K24',
        shortReview:
          'Still the best basketball game, but the microtransactions are disappointing.',
      },
      [Language.JA]: {
        title: 'NBA 2K24',
        shortReview:
          '依然として最高のバスケットボールゲームですが、課金要素が残念です。',
      },
    },
    genres: ['Sports', 'Simulation'],
    playedOn: Platform.STEAM,
    rating: 14,
    isDraft: false,
    createdAt: '2024-01-03',
  },
  {
    translations: {
      [Language.KO]: {
        title: '몬스터 헌터 라이즈',
        shortReview:
          '새로운 이동 시스템으로 더욱 역동적인 사냥이 가능해졌습니다.',
      },
      [Language.EN]: {
        title: 'Monster Hunter Rise',
        shortReview: 'New movement system enables more dynamic hunting.',
      },
      [Language.JA]: {
        title: 'モンスターハンターライズ',
        shortReview:
          '新しい移動システムでよりダイナミックな狩りが可能になりました。',
      },
    },
    genres: ['Action', 'RPG'],
    playedOn: Platform.SWITCH,
    rating: 13,
    isDraft: false,
    createdAt: '2024-01-01',
  },
  {
    translations: {
      [Language.KO]: {
        title: 'EA FC 24',
        shortReview: '피파에서 이름만 바뀐 듯한 아쉬운 변화.',
      },
      [Language.EN]: {
        title: 'EA FC 24',
        shortReview:
          'A disappointing change that seems like just a name change from FIFA.',
      },
      [Language.JA]: {
        title: 'EA FC 24',
        shortReview: 'FIFAから名前だけ変わったような残念な変化。',
      },
    },
    genres: ['Sports'],
    playedOn: Platform.STEAM,
    rating: 12,
    isDraft: false,
    createdAt: '2023-12-30',
  },
  {
    translations: {
      [Language.KO]: {
        title: '로스트 아크',
        shortReview:
          '화려한 전투와 방대한 콘텐츠가 장점이지만 과금 요소가 아쉽습니다.',
      },
      [Language.EN]: {
        title: 'Lost Ark',
        shortReview:
          'Impressive combat and vast content, but microtransactions are disappointing.',
      },
      [Language.JA]: {
        title: 'ロストアーク',
        shortReview:
          '華麗な戦闘と膨大なコンテンツが魅力ですが、課金要素が残念です。',
      },
    },
    genres: ['RPG', 'Action'],
    playedOn: Platform.STEAM,
    rating: 11,
    isDraft: false,
    createdAt: '2023-12-28',
  },
  {
    translations: {
      [Language.KO]: {
        title: '포켓몬 스칼렛',
        shortReview: '오픈월드로의 도전은 좋았으나 기술적 완성도가 아쉽습니다.',
      },
      [Language.EN]: {
        title: 'Pokémon Scarlet',
        shortReview:
          'A good attempt at open world, but technical polish is lacking.',
      },
      [Language.JA]: {
        title: 'ポケットモンスター スカーレット',
        shortReview:
          'オープンワールドへの挑戦は良かったものの、技術的な完成度が惜しまれます。',
      },
    },
    genres: ['RPG', 'Adventure'],
    playedOn: Platform.SWITCH,
    rating: 10,
    isDraft: false,
    createdAt: '2023-12-25',
  },
  {
    translations: {
      [Language.KO]: {
        title: '더 워킹 데드: 데스티니',
        shortReview: '시리즈의 이름값을 살리지 못한 아쉬운 작품.',
      },
      [Language.EN]: {
        title: 'The Walking Dead: Destinies',
        shortReview:
          "A disappointing title that fails to live up to the series' name.",
      },
      [Language.JA]: {
        title: 'ウォーキング・デッド：デスティニー',
        shortReview: 'シリーズの名に恥じる残念な作品。',
      },
    },
    genres: ['Adventure', 'Strategy'],
    playedOn: Platform.STEAM,
    rating: 8,
    isDraft: false,
    createdAt: '2023-12-23',
  },
  {
    translations: {
      [Language.KO]: {
        title: '로드 오브 더 링즈: 골룸',
        shortReview: '흥미로운 설정에 비해 단조로운 게임플레이가 아쉽습니다.',
      },
      [Language.EN]: {
        title: 'The Lord of the Rings: Gollum',
        shortReview: 'Monotonous gameplay despite interesting premise.',
      },
      [Language.JA]: {
        title: 'ロード・オブ・ザ・リング：ゴラム',
        shortReview: '興味深い設定の割に単調なゲームプレイが残念です。',
      },
    },
    genres: ['Adventure'],
    playedOn: Platform.STEAM,
    rating: 7,
    isDraft: false,
    createdAt: '2023-12-20',
  },
  {
    translations: {
      [Language.KO]: {
        title: '레디어스 리메이크',
        shortReview: '고전의 감성은 살렸으나 현대적 재해석이 부족합니다.',
      },
      [Language.EN]: {
        title: 'Radious Remake',
        shortReview:
          'Maintains classic feel but lacks modern reinterpretation.',
      },
      [Language.JA]: {
        title: 'レディアス リメイク',
        shortReview:
          '古典の感性は残しましたが、現代的な再解釈が不足しています。',
      },
    },
    genres: ['Action'],
    playedOn: Platform.STEAM,
    rating: 6,
    isDraft: false,
    createdAt: '2023-12-18',
  },
  {
    translations: {
      [Language.KO]: {
        title: '더 라스트 오브 어스 PC',
        shortReview: '최적화 문제가 심각한 PC 포팅.',
      },
      [Language.EN]: {
        title: 'The Last of Us PC',
        shortReview: 'A PC port with serious optimization issues.',
      },
      [Language.JA]: {
        title: 'ラスト・オブ・アス PC',
        shortReview: '最適化の問題が深刻なPCポート。',
      },
    },
    genres: ['Action', 'Adventure'],
    playedOn: Platform.STEAM,
    rating: 5,
    isDraft: false,
    createdAt: '2023-12-15',
  },
  {
    translations: {
      [Language.KO]: {
        title: '파이널 판타지 16',
        shortReview:
          '액션성 강화로 호불호가 갈리지만 개인적으로는 만족스러운 작품.',
      },
      [Language.EN]: {
        title: 'Final Fantasy XVI',
        shortReview:
          'Divisive due to enhanced action, but personally satisfying.',
      },
      [Language.JA]: {
        title: 'ファイナルファンタジーXVI',
        shortReview:
          'アクション性強化で賛否両論ですが、個人的には満足できる作品です。',
      },
    },
    genres: ['Action', 'RPG'],
    playedOn: Platform.STEAM,
    rating: 17,
    isDraft: true,
    createdAt: '2023-12-13',
  },
  {
    translations: {
      [Language.KO]: {
        title: '디아블로 4',
        shortReview:
          '핵심 재미요소는 살렸으나 라이브 서비스 요소가 아쉽습니다.',
      },
      [Language.EN]: {
        title: 'Diablo IV',
        shortReview:
          'Core gameplay elements shine, but live service aspects disappoint.',
      },
      [Language.JA]: {
        title: 'ディアブロ IV',
        shortReview:
          '核となる面白さは健在ですが、ライブサービス要素が残念です。',
      },
    },
    genres: ['Action', 'RPG'],
    playedOn: Platform.EPIC,
    rating: 16,
    isDraft: true,
    createdAt: '2023-12-10',
  },
  {
    translations: {
      [Language.KO]: {
        title: '스트리트 파이터 6',
        shortReview: '격투 게임의 진화된 모습을 보여줍니다.',
      },
      [Language.EN]: {
        title: 'Street Fighter 6',
        shortReview: 'Shows the evolved form of fighting games.',
      },
      [Language.JA]: {
        title: 'ストリートファイター6',
        shortReview: '格闘ゲームの進化した姿を見せています。',
      },
    },
    genres: ['Fighting'],
    playedOn: Platform.STEAM,
    rating: 16,
    isDraft: true,
    createdAt: '2023-12-08',
  },
  {
    translations: {
      [Language.KO]: {
        title: '워해머 40,000: 다크타이드',
        shortReview: '버밀타이드의 40K 버전. 세계관은 훌륭합니다.',
      },
      [Language.EN]: {
        title: 'Warhammer 40,000: Darktide',
        shortReview:
          "Vermintide's 40K version. The universe setting is excellent.",
      },
      [Language.JA]: {
        title: 'ウォーハンマー40,000：ダークタイド',
        shortReview: 'バーミンタイドの40Kバージョン。世界観は素晴らしいです。',
      },
    },
    genres: ['Action', 'Shooting'],
    playedOn: Platform.STEAM,
    rating: 15,
    isDraft: true,
    createdAt: '2023-12-05',
  },
  {
    translations: {
      [Language.KO]: {
        title: '카트라이더: 드리프트',
        shortReview: '향수는 자극하지만 완성도는 아쉽습니다.',
      },
      [Language.EN]: {
        title: 'KartRider: Drift',
        shortReview: 'Triggers nostalgia but lacks polish.',
      },
      [Language.JA]: {
        title: 'カートライダー：ドリフト',
        shortReview: 'ノスタルジーは刺激しますが、完成度が惜しまれます。',
      },
    },
    genres: ['Racing'],
    playedOn: Platform.STEAM,
    rating: 14,
    isDraft: true,
    createdAt: '2023-12-03',
  },
  {
    translations: {
      [Language.KO]: {
        title: '컴파니 오브 히어로즈 3',
        shortReview: '전작의 매력을 이어가지 못한 속편.',
      },
      [Language.EN]: {
        title: 'Company of Heroes 3',
        shortReview:
          'A sequel that fails to carry on the charm of its predecessor.',
      },
      [Language.JA]: {
        title: 'カンパニー・オブ・ヒーローズ 3',
        shortReview: '前作の魅力を引き継げなかった続編。',
      },
    },
    genres: ['Strategy'],
    playedOn: Platform.STEAM,
    rating: 13,
    isDraft: true,
    createdAt: '2023-12-01',
  },
  {
    translations: {
      [Language.KO]: {
        title: '고담 나이츠',
        shortReview: '배트맨 시리즈의 실망스러운 스핀오프.',
      },
      [Language.EN]: {
        title: 'Gotham Knights',
        shortReview: 'A disappointing spin-off of the Batman series.',
      },
      [Language.JA]: {
        title: 'ゴッサム・ナイツ',
        shortReview: 'バットマンシリーズの期待外れなスピンオフ。',
      },
    },
    genres: ['Action', 'Adventure'],
    playedOn: Platform.EPIC,
    rating: 9,
    isDraft: true,
    createdAt: '2023-11-28',
  },
  {
    translations: {
      [Language.KO]: {
        title: '번아웃 파라다이스 리마스터',
        shortReview: '최적화가 아쉬운 리마스터.',
      },
      [Language.EN]: {
        title: 'Burnout Paradise Remastered',
        shortReview: 'A remaster with disappointing optimization.',
      },
      [Language.JA]: {
        title: 'バーンアウト パラダイス リマスター',
        shortReview: '最適化が惜しまれるリマスター。',
      },
    },
    genres: ['Racing'],
    playedOn: Platform.STEAM,
    rating: 8,
    isDraft: true,
    createdAt: '2023-11-25',
  },
  {
    translations: {
      [Language.KO]: {
        title: '드래곤즈 도그마 2',
        shortReview: '현재 플레이 진행 중입니다.',
      },
      [Language.EN]: {
        title: "Dragon's Dogma 2",
        shortReview: 'Currently playing through the game.',
      },
      [Language.JA]: {
        title: 'ドラゴンズドグマ 2',
        shortReview: '現在プレイ進行中です。',
      },
    },
    genres: ['Action', 'RPG'],
    playedOn: Platform.STEAM,
    rating: 0,
    isDraft: true,
    createdAt: '2024-02-25',
  },
  {
    translations: {
      [Language.KO]: {
        title: '라이즈 오브 더 룬브레이커',
        shortReview: '초반 진행 중입니다.',
      },
      [Language.EN]: {
        title: 'Rise of the Runebreaker',
        shortReview: 'In the early stages of the game.',
      },
      [Language.JA]: {
        title: 'ライズ・オブ・ザ・ルーンブレイカー',
        shortReview: '序盤進行中です。',
      },
    },
    genres: ['Strategy', 'RPG'],
    playedOn: Platform.GOG,
    rating: 0,
    isDraft: true,
    createdAt: '2024-02-20',
  },
  {
    translations: {
      [Language.KO]: {
        title: '팔월의 연금술사',
        shortReview: '아직 평가를 내리기에는 이른 것 같습니다.',
      },
      [Language.EN]: {
        title: 'Atelier August',
        shortReview: 'Too early to make an assessment.',
      },
      [Language.JA]: {
        title: '八月の錬金術師',
        shortReview: 'まだ評価を下すには早いようです。',
      },
    },
    genres: ['RPG', 'Simulation'],
    playedOn: Platform.SWITCH,
    rating: 0,
    isDraft: true,
    createdAt: '2024-02-15',
  },
  {
    translations: {
      [Language.KO]: {
        title: '마블 스냅',
        shortReview: '흥미로운 전략성의 카드 게임.',
      },
      [Language.EN]: {
        title: 'Marvel Snap',
        shortReview: 'A card game with interesting strategic elements.',
      },
      [Language.JA]: {
        title: 'マーベル スナップ',
        shortReview: '興味深い戦略性のカードゲーム。',
      },
    },
    genres: ['Strategy', 'Card'],
    playedOn: Platform.ANDROID,
    rating: 15,
    isDraft: false,
    createdAt: '2023-11-20',
  },
  {
    translations: {
      [Language.KO]: {
        title: '쿠키런: 킹덤',
        shortReview: '귀여운 그래픽과 중독성 있는 수집형 RPG.',
      },
      [Language.EN]: {
        title: 'Cookie Run: Kingdom',
        shortReview:
          'A collection RPG with cute graphics and addictive gameplay.',
      },
      [Language.JA]: {
        title: 'クッキーラン：キングダム',
        shortReview: '可愛らしいグラフィックと中毒性のあるコレクションRPG。',
      },
    },
    genres: ['RPG', 'Strategy'],
    playedOn: Platform.ANDROID,
    rating: 12,
    isDraft: false,
    createdAt: '2023-11-10',
  },
];
