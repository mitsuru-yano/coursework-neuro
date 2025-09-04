import { useTTSContext } from '@context/TTSContext'
import { Card, CardBody, CardHeading } from '@ui/Card'
import { Range, Select, Heading, Button } from '@ui/index'

export const TTSSettings = () => {
    const {
        filteredEnVoices, // голоса для выбранного языка
        filteredRuVoices, // голоса для выбранного языка
        selectedEnVoice,
        selectedRuVoice,
        setSelectedEnVoice,
        setSelectedRuVoice,
        rate,
        setRate,
        pitch,
        setPitch,
        speakMultilang,
    } = useTTSContext()

    return (
        <Card fullWidth>
            <CardHeading>
                <Heading as="span">Text-To-Speech Settings</Heading>
            </CardHeading>
            <CardBody>
                <Select
                    label="Select EN Voice"
                    value={selectedEnVoice?.name}
                    options={filteredEnVoices}
                    optName="name"
                    optKey="name"
                    optValue="name"
                    onChange={(e) =>
                        setSelectedEnVoice(filteredEnVoices.find((v) => v.name === e.target.value))
                    }
                />
                <Select
                    label="Select RU Voice"
                    value={selectedRuVoice?.name}
                    options={filteredRuVoices}
                    optName="name"
                    optKey="name"
                    optValue="name"
                    onChange={(e) =>
                        setSelectedRuVoice(filteredRuVoices.find((v) => v.name === e.target.value))
                    }
                />

                <Range
                    label="Скорость"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                />

                <Range
                    label="Тон"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                />
            </CardBody>
        </Card>
    )
}
