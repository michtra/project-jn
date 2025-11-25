import React, { useState, useMemo } from 'react';

const WeightCalculator = ({ initialWeight = 45, compact = false, weightUnit = 'lbs' }) => {
    const [totalWeight, setTotalWeight] = useState(initialWeight);
    const [useCollars, setUseCollars] = useState(false);

    const config = weightUnit === 'lbs'
        ? {
            barbellWeight: 45,
            collarWeight: 0,
            plateWeights: [45, 25, 10, 5, 2.5],
            plateColors: {
                45: '#1f2937',
                25: '#1f2937',
                10: '#1f2937',
                5: '#1f2937',
                2.5: '#1f2937'
            },
            unit: 'lbs'
          }
        : {
            barbellWeight: 20,
            collarWeight: 2.5,
            plateWeights: [25, 20, 15, 10, 5, 2.5, 1.25],
            plateColors: {
                25: '#dc2626',  // Red
                20: '#2563eb',  // Blue
                15: '#eab308',  // Yellow
                10: '#16a34a',  // Green
                5: '#ffffff',   // White
                2.5: '#6b7280', // Gray
                1.25: '#c0c0c0' // Silver
            },
            unit: 'kg'
          };

    const { barbellWeight, collarWeight, plateWeights, plateColors } = config;

    // Update weight when initialWeight changes (only on mount)
    React.useEffect(() => {
        setTotalWeight(initialWeight);
    }, [initialWeight]);

    const calculatePlates = useMemo(() => {
        const totalBarbellWeight = barbellWeight + (useCollars ? collarWeight * 2 : 0);

        if (totalWeight <= totalBarbellWeight) {
            return [];
        }

        const weightPerSide = (totalWeight - totalBarbellWeight) / 2;
        const plates = [];
        let weightRemaining = weightPerSide;

        for (const plate of plateWeights) {
            const plateCount = Math.floor(weightRemaining / plate);
            if (plateCount > 0) {
                plates.push({
                    weight: plate,
                    count: plateCount
                });
                weightRemaining -= plateCount * plate;
            }
        }
        return plates;
    }, [totalWeight, useCollars, plateWeights, barbellWeight, collarWeight]);

    const actualWeight = barbellWeight + (useCollars ? collarWeight * 2 : 0) + (calculatePlates.reduce((sum, plate) => sum + (plate.weight * plate.count), 0) * 2);
    const weightDifference = totalWeight - actualWeight;
    const totalBarbellWeight = barbellWeight + (useCollars ? collarWeight * 2 : 0);

    const PlateVisualization = ({ plates }) => {
        const flattenedPlates = [];
        plates.forEach((plate) => {
            for (let i = 0; i < plate.count; i++) {
                flattenedPlates.push(plate.weight);
            }
        });

        return (
            <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ height: '16px', width: '64px', background: 'rgba(71, 85, 105, 0.8)' }}></div>
                    {flattenedPlates.map((weight, index) => {
                        const bgColor = plateColors[weight] || '#1f2937';
                        const isWhitePlate = (bgColor === '#ffffff');
                        const textColor = isWhitePlate ? '#1f2937' : '#f1f5f9';
                        return (
                            <div
                                key={`plate-${index}`}
                                style={{
                                    backgroundColor: bgColor,
                                    borderColor: 'rgba(100, 116, 139, 0.5)',
                                    color: textColor,
                                    width: '60px',
                                    height: '40px',
                                    border: '2px solid rgba(100, 116, 139, 0.5)',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.875rem',
                                    marginLeft: '4px'
                                }}
                            >
                                {weight}
                            </div>
                        );
                    })}
                </div>

                {weightUnit === 'kg' && (
                    <div>
                        <button
                            onClick={() => setUseCollars(!useCollars)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                transition: 'all 0.2s',
                                background: useCollars
                                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                    : 'rgba(51, 65, 85, 0.5)',
                                color: useCollars ? 'white' : '#94a3b8',
                                border: useCollars ? 'none' : '1px solid rgba(100, 116, 139, 0.3)',
                                cursor: 'pointer'
                            }}
                        >
                            Collars {useCollars ? 'ON' : 'OFF'}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`${compact ? 'max-w-2xl' : 'max-w-4xl'} mx-auto rounded-lg ${compact ? '' : 'shadow-lg'}`} style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(148, 163, 184, 0.1)', padding: compact ? '1rem' : '3rem' }}>
            {!compact && (
                <h1 className="text-3xl font-bold text-center" style={{ color: '#f1f5f9', marginBottom: '2.5rem' }}>
                    Weight Plate Calculator
                </h1>
            )}

            {!compact && (
                <div className="mb-8 flex justify-center">
                    <div className="flex items-center gap-4">
                        <label className="text-lg font-medium" style={{ color: '#cbd5e1' }}>
                            Target Weight ({weightUnit})
                        </label>
                        <input
                            type="number"
                            value={totalWeight || ''}
                            placeholder="Enter weight"
                            onChange={(e) => setTotalWeight(Number(e.target.value) || 0)}
                            className="text-2xl font-bold text-center rounded-lg px-4 py-2 w-40 focus:outline-none"
                            style={{
                                border: '2px solid rgba(100, 116, 139, 0.3)',
                                background: 'rgba(51, 65, 85, 0.5)',
                                color: '#f1f5f9'
                            }}
                            step={weightUnit === 'lbs' ? '2.5' : '2.5'}
                        />
                    </div>
                </div>
            )}

            {totalWeight > totalBarbellWeight ? (
                <PlateVisualization plates={calculatePlates} />
            ) : (
                <div className="text-center py-8" style={{ color: '#cbd5e1' }}>
                    <p>Enter a weight greater than {totalBarbellWeight}{weightUnit} to see the plate configuration</p>
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                        (Barbell: {barbellWeight}{weightUnit}{useCollars && weightUnit === 'kg' ? `, Collars: ${collarWeight * 2}${weightUnit}` : ''})
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeightCalculator;