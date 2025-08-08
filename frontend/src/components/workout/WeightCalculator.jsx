import React, { useState, useMemo } from 'react';

const WeightCalculator = ({ initialWeight = 20, compact = false }) => {
    const [totalWeight, setTotalWeight] = useState(initialWeight);
    const [useCollars, setUseCollars] = useState(false);
    const barbellWeight = 20; // standard powerlifting barbell weighs 20kg
    const collarWeight = 2.5; // powerlifting collar weight in kg
    const plateWeights = [25, 20, 15, 10, 5, 2.5, 1.25]; // standard powerlifting plates
    const plateColors = {
        25: '#dc2626',  // Red
        20: '#2563eb',  // Blue
        15: '#eab308',  // Yellow
        10: '#16a34a',  // Green
        5: '#ffffff',   // White
        2.5: '#6b7280', // Gray
        1.25: '#c0c0c0' // Silver
    };

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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ height: '16px', backgroundColor: '#374151', width: '64px' }}></div>
                    {flattenedPlates.map((weight, index) => (
                        <div
                            key={`plate-${index}`}
                            style={{
                                backgroundColor: plateColors[weight],
                                color: weight === 5 || weight === 1.25 ? '#000' : '#fff',
                                width: '60px',
                                height: '40px',
                                border: '2px solid #4b5563',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                marginLeft: '4px'
                            }}
                        >
                            {weight}
                        </div>
                    ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            backgroundColor: '#0f172a',
                            color: '#f8fafc',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '1rem',
                            minWidth: '120px'
                        }}>
                            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>Total Weight</div>
                            <div style={{ 
                                fontSize: compact ? '24px' : '48px', 
                                fontWeight: 'bold', 
                                color: '#f8fafc' 
                            }}>
                                {actualWeight}kg
                            </div>
                            {weightDifference !== 0 && (
                                <div style={{
                                    fontSize: '14px',
                                    marginTop: '4px',
                                    color: weightDifference > 0 ? '#dc2626' : '#16a34a'
                                }}>
                                    {weightDifference > 0 ? `-${weightDifference}kg` : `+${Math.abs(weightDifference)}kg`}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setUseCollars(!useCollars)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: '500',
                            fontSize: '14px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            backgroundColor: useCollars ? '#2563eb' : '#4b5563',
                            color: '#ffffff'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = useCollars ? '#1d4ed8' : '#374151';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = useCollars ? '#2563eb' : '#4b5563';
                        }}
                    >
                        Collars {useCollars ? '(ON)' : '(OFF)'}
                    </button>
                </div>
            </div>
        );
    };

    return (
       <div style={{
           maxWidth: compact ? '512px' : '896px',
           margin: '0 auto',
           padding: compact ? '16px' : '24px',
           backgroundColor: 'transparent',
           color: '#f8fafc',
           border: 'none',
           boxShadow: 'none',
           borderRadius: '0'
       }}>
            {!compact && (
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '24px',
                    color: '#f8fafc'
                }}>
                    Weight Plate Calculator
                </h1>
            )}

            {!compact && (
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '18px',
                            fontWeight: '500',
                            color: '#f8fafc',
                            marginBottom: '8px'
                        }}>
                            Target Weight (kg)
                        </label>
                        <input
                            type="number"
                            value={totalWeight || ''}
                            placeholder="Enter weight"
                            onChange={(e) => setTotalWeight(Number(e.target.value) || 0)}
                            style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                border: '2px solid #4b5563',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                width: '160px',
                                backgroundColor: '#374151',
                                color: '#f8fafc',
                                outline: 'none'
                            }}
                            step="2.5"
                            onFocus={(e) => {
                                e.target.style.borderColor = '#2563eb';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#4b5563';
                            }}
                        />
                    </div>
                </div>
            )}

            {totalWeight > totalBarbellWeight ? (
                <PlateVisualization plates={calculatePlates} />
            ) : (
                <div style={{
                    textAlign: 'center',
                    color: '#9ca3af',
                    padding: '32px 0'
                }}>
                    <p>Enter a weight greater than {totalBarbellWeight}kg to see the plate configuration</p>
                    <p style={{ fontSize: '14px', marginTop: '4px' }}>
                        (Barbell: {barbellWeight}kg{useCollars ? `, Collars: ${collarWeight * 2}kg` : ''})
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeightCalculator;