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
            <div className="flex flex-col items-center">
                <div className="flex items-center mb-4">
                    <div className="h-4 bg-gray-800 w-16"></div>
                    {flattenedPlates.map((weight, index) => (
                        <div
                            key={`plate-${index}`}
                            className="border-2 border-gray-600 rounded flex items-center justify-center font-bold text-sm ml-1"
                            style={{
                                backgroundColor: plateColors[weight],
                                color: weight === 5 || weight === 1.25 ? '#000' : '#fff',
                                width: '60px',
                                height: '40px'
                            }}
                        >
                            {weight}
                        </div>
                    ))}
                </div>
                
                <div className="flex items-center space-x-6">
                    <div className="text-center">
                        <div className="bg-gray-100 rounded-lg p-4 min-w-[120px]">
                            <div className="text-sm text-gray-600 mb-1">Total Weight</div>
                            <div className={`${compact ? 'text-xl' : 'text-3xl'} font-bold text-gray-800`}>{actualWeight}kg</div>
                            {weightDifference !== 0 && (
                                <div className={`text-sm mt-1 ${weightDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {weightDifference > 0 ? `-${weightDifference}kg` : `+${Math.abs(weightDifference)}kg`}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setUseCollars(!useCollars)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            useCollars 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                    >
                        Collars {useCollars ? '(ON)' : '(OFF)'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={`${compact ? 'max-w-2xl' : 'max-w-4xl'} mx-auto p-${compact ? '4' : '6'} bg-white rounded-lg ${compact ? '' : 'shadow-lg'}`}>
            {!compact && (
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Weight Plate Calculator
                </h1>
            )}

            {!compact && (
                <div className="mb-8">
                    <div className="text-center mb-4">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Target Weight (kg)
                        </label>
                        <input
                            type="number"
                            value={totalWeight || ''}
                            placeholder="Enter weight"
                            onChange={(e) => setTotalWeight(Number(e.target.value) || 0)}
                            className="text-2xl font-bold text-center border-2 border-gray-300 rounded-lg px-4 py-2 w-40 focus:border-blue-500 focus:outline-none"
                            step="2.5"
                        />
                    </div>
                </div>
            )}

            {totalWeight > totalBarbellWeight ? (
                <PlateVisualization plates={calculatePlates} />
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <p>Enter a weight greater than {totalBarbellWeight}kg to see the plate configuration</p>
                    <p className="text-sm mt-1">
                        (Barbell: {barbellWeight}kg{useCollars ? `, Collars: ${collarWeight * 2}kg` : ''})
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeightCalculator;