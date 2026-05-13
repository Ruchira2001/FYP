/**
 * AppLogo – reusable two-image logo
 *
 * variant="vertical"   → Globe on top, "goviconnect SL" text below  (auth pages)
 * variant="horizontal" → Globe on left, "goviconnect SL" text right  (top bar)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
    Circle,
    Ellipse,
    Line,
    Path,
    Defs,
    LinearGradient as SvgGrad,
    Stop,
} from 'react-native-svg';

interface AppLogoProps {
    variant?: 'vertical' | 'horizontal';
    globeSize?: number;
    brandFontSize?: number;
    slFontSize?: number;
}

// ─── Globe SVG ────────────────────────────────────────────────────────────────
const GlobeSvg: React.FC<{ size: number }> = ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
            <SvgGrad id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#86efac" />
                <Stop offset="100%" stopColor="#16a34a" />
            </SvgGrad>
        </Defs>
        <Circle cx="100" cy="100" r="90" fill="none" stroke="url(#g1)" strokeWidth="3" />
        <Ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="#4ade80" strokeWidth="2" />
        <Ellipse cx="100" cy="100" rx="90" ry="60" fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <Line x1="10" y1="100" x2="190" y2="100" stroke="#4ade80" strokeWidth="2" />
        <Ellipse cx="100" cy="100" rx="30" ry="90" fill="none" stroke="#4ade80" strokeWidth="2" />
        <Ellipse cx="100" cy="100" rx="60" ry="90" fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <Line x1="100" y1="10" x2="100" y2="190" stroke="#4ade80" strokeWidth="2" />
        {[
            [100, 10], [100, 190], [10, 100], [190, 100],
            [55, 30], [145, 30], [55, 170], [145, 170],
            [30, 65], [170, 65], [30, 135], [170, 135],
            [100, 100],
        ].map(([cx, cy], i) => (
            <Circle key={i} cx={cx} cy={cy} r="5" fill="#16a34a" />
        ))}
        <Path d="M100,10 C95,5 90,8 93,13 C96,18 103,15 100,10Z" fill="#bbf7d0" />
        <Path d="M55,30 C50,25 45,28 48,33 C51,38 58,35 55,30Z" fill="#bbf7d0" />
        <Path d="M145,30 C140,25 135,28 138,33 C141,38 148,35 145,30Z" fill="#bbf7d0" />
        <Path d="M30,65 C25,60 20,63 23,68 C26,73 33,70 30,65Z" fill="#bbf7d0" />
        <Path d="M170,135 C165,130 160,133 163,138 C166,143 173,140 170,135Z" fill="#bbf7d0" />
    </Svg>
);

// ─── AppLogo ──────────────────────────────────────────────────────────────────
const AppLogo: React.FC<AppLogoProps> = ({
    variant = 'vertical',
    globeSize,
    brandFontSize,
    slFontSize,
}) => {
    const isHorizontal = variant === 'horizontal';

    // Default sizes per variant
    const gSize = globeSize ?? (isHorizontal ? 36 : 140);
    const bSize = brandFontSize ?? (isHorizontal ? 22 : 38);
    const sSize = slFontSize ?? (isHorizontal ? 11 : 14);

    const textBlock = (
        <View style={[styles.textRow, isHorizontal && styles.textRowHorizontal]}>
            <Text style={[styles.brand, { fontSize: bSize }]}>goviconnect</Text>
            <Text style={[styles.sl, { fontSize: sSize }]}>SL</Text>
        </View>
    );

    if (isHorizontal) {
        return (
            <View style={styles.horizontal}>
                <GlobeSvg size={gSize} />
                {textBlock}
            </View>
        );
    }

    return (
        <View style={styles.vertical}>
            <GlobeSvg size={gSize} />
            {textBlock}
        </View>
    );
};

const styles = StyleSheet.create({
    vertical: {
        alignItems: 'center',
    },
    horizontal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
    },
    textRowHorizontal: {
        marginTop: 0,
        marginLeft: 6,
    },
    brand: {
        fontFamily: 'Apricots',
        color: '#16a34a',
        includeFontPadding: false,
        letterSpacing: 1.5,
    },
    sl: {
        fontWeight: '700',
        color: '#374151',
        marginTop: 2,
        marginLeft: 2,
    },
});

export default AppLogo;
